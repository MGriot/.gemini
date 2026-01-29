Ëëimport pdfplumber
import re
import datetime
import os
import sys
from typing import Dict, Any, List, Optional
from io import BytesIO
import base64

# New imports
from .core_types import ExtractionMethod, TableStrategy, FieldType
from .data_parser import DataParser

try:
    import pytesseract
    import cv2
    import numpy as np
    from PIL import Image
    from img2table.document import Image as IMG2TableImage
    from img2table.ocr import TesseractOCR
    HAS_OCR = True
    
    # Windows Tesseract Path Fix
    if sys.platform.startswith('win'):
        tesseract_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.join(os.getenv('LOCALAPPDATA', ''), r'Tesseract-OCR\tesseract.exe')
        ]
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break
except ImportError:
    HAS_OCR = False

class GenericPDFParser:
    """
    Generic Parser that executes a user-defined template configuration.
    Refactored to support explicit Extraction Methods and Table Strategies.
    """

    @classmethod
    def get_page_count(cls, file_path: str) -> int:
        with pdfplumber.open(file_path) as pdf:
            return len(pdf.pages)

    # -------------------------------------------------------------------------
    # Migration / Normalization Layer
    # -------------------------------------------------------------------------
    @classmethod
    def _normalize_config(cls, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensures the configuration follows the new schema.
        Applies defaults for backward compatibility.
        """
        # Deep copy to avoid mutating original if needed, but dict is usually pass-by-ref
        # For simplicity, we modify in place or create new structs where needed.
        
        stages = config.get("stages", [])
        if not stages:
            # Handle legacy single-list-of-regions
            regions = config.get("regions", [])
            stages = [{"id": "legacy", "name": "Legacy Stage", "regions": regions, "transitions": []}]
            config["stages"] = stages
            config["start_stage_id"] = "legacy"

        for stage in stages:
            for region in stage.get("regions", []):
                # 1. Migrate Extraction Method
                # Old: extractionMethod='text'|'ocr' (string)
                # New: extractionMethod=ExtractionMethod enum
                method = region.get("extractionMethod")
                if not method:
                    region["extractionMethod"] = ExtractionMethod.RAW_TEXT
                elif method == "text":
                    region["extractionMethod"] = ExtractionMethod.RAW_TEXT
                elif method == "ocr":
                    region["extractionMethod"] = ExtractionMethod.OCR
                # If already compliant, leave it.

                # 2. Migrate Table Strategy
                if region.get("type") == "table":
                    mode = region.get("tableExtractionMode") # old key
                    strategy = region.get("tableStrategy")   # new key
                    
                    if not strategy:
                        if mode == "auto":
                            region["tableStrategy"] = TableStrategy.PHYSICAL_GRID
                        else:
                            region["tableStrategy"] = TableStrategy.MANUAL
                
                # 3. Ensure columns/fields have types
                if region.get("columns"):
                    for col in region["columns"]:
                        if "type" not in col: col["type"] = FieldType.TEXT
                        # Map legacy 'string' -> 'text'
                        if col["type"] == "string": col["type"] = FieldType.TEXT
                        if col["type"] == "float": col["type"] = FieldType.NUMBER
                
                if region.get("fields"):
                    for field in region["fields"]:
                         # KV fields might not have had types before
                        if "type" not in field: field["type"] = FieldType.TEXT

        return config

    # -------------------------------------------------------------------------
    # Core Extraction Logic
    # -------------------------------------------------------------------------
    @classmethod
    def _extract_region(cls, page: Any, region: Dict[str, Any], page_dims: tuple) -> Any:
        """
        Dispatch method for extracting data from a single region.
        """
        method = region.get("extractionMethod", ExtractionMethod.RAW_TEXT)
        r_type = region.get("type", "text")
        
        # Calculate coordinates
        width_pt, height_pt = page_dims
        x0 = (region['x'] / 100.0) * width_pt
        top = (region['y'] / 100.0) * height_pt
        w_px = (region['w'] / 100.0) * width_pt
        h_px = (region['h'] / 100.0) * height_pt
        crop_box = (max(0, x0), max(0, top), min(width_pt, x0 + w_px), min(height_pt, top + h_px))

        # Crop
        try:
            cropped_page = page.crop(crop_box)
        except Exception:
            return None # Crop failed (out of bounds?)

        # --- DISPATCH BY METHOD ---
        if method == ExtractionMethod.RAW_TEXT:
            return cls._extract_raw_text(cropped_page, region, (w_px, h_px), (x0, top))
            
        elif method == ExtractionMethod.OCR:
            if not HAS_OCR:
                return {"_warning": "OCR engine not available"}
            return cls._extract_ocr(cropped_page, region, (w_px, h_px), (x0, top))
            
        elif method == ExtractionMethod.HYBRID:
            # Try Text first
            result = cls._extract_raw_text(cropped_page, region, (w_px, h_px), (x0, top))
            if cls._is_result_empty(result):
                if HAS_OCR:
                    return cls._extract_ocr(cropped_page, region, (w_px, h_px), (x0, top))
                else:
                    return {"_warning": "OCR fallback unavailable", "data": result}
            return result
            
        return None

    @staticmethod
    def _is_result_empty(result: Any) -> bool:
        if result is None: return True
        if isinstance(result, str) and not result.strip(): return True
        if isinstance(result, list) and len(result) == 0: return True
        if isinstance(result, dict) and not result: return True
        return False

    @classmethod
    def _extract_raw_text(cls, cropped_page: Any, region: Dict, dims: tuple, origin: tuple) -> Any:
        r_type = region.get("type")
        
        if r_type == 'text':
            val = cropped_page.extract_text() or ""
            # Use dbMap if available, else name
            key = region.get("dbMap") or region['name']
            return {key: DataParser.parse_value(val, FieldType.TEXT)}
            
        elif r_type == 'key_value':
            return cls._extract_kv_text(cropped_page, region, dims)
            
        elif r_type == 'table':
            # Raw text tables rely on words/lines
            words = cropped_page.extract_words(keep_blank_chars=False, x_tolerance=3, y_tolerance=3)
            return cls._extract_table_manual(words, region.get('columns', []), dims[0], origin[0])
            
        return None

    @classmethod
    def _extract_ocr(cls, cropped_page: Any, region: Dict, dims: tuple, origin: tuple) -> Any:
        # Convert to Image
        img = cropped_page.to_image(resolution=300).original
        
        # Preprocess once for everything (Upscaling + Adaptive Threshold)
        processed_img = cls._preprocess_image(img)
        
        r_type = region.get("type")
        lang = region.get("language", "ita") # Default to Italian
        
        if r_type == 'table':
            strategy = region.get("tableStrategy", TableStrategy.MANUAL)
            # We get words here to have them ready for fallback or manual/typographic
            ocr_words = cls._get_ocr_words(img, offset_x=origin[0], offset_y=origin[1])
            
            if strategy == TableStrategy.PHYSICAL_GRID:
                # Use upscaled image for img2table, pass words for fallback
                raw_table = cls._extract_table_physical(processed_img, original_words=ocr_words)
                return cls._post_process_table_data(raw_table)
            elif strategy == TableStrategy.TYPOGRAPHIC:
                raw_table = cls._extract_table_typographic(ocr_words)
                return cls._post_process_table_data(raw_table)
            else:
                # OCR + Manual Binning
                return cls._extract_table_manual(ocr_words, region.get('columns', []), dims[0], origin[0])

        # Preprocess for Text/KV
        config = cls._get_tesseract_config(r_type, region.get('psm'), lang=lang)
        
        if r_type == 'text':
            text = pytesseract.image_to_string(processed_img, config=config).strip()
            # If user defined a specific data type for this text region, parse it
            target_type = region.get("dataType", FieldType.TEXT)
            # Use dbMap if available
            key = region.get("dbMap") or region['name']
            return {key: DataParser.parse_value(text, target_type)}
            
        elif r_type == 'key_value':
            return cls._extract_kv_ocr(cropped_page, region, dims, config)
            
        return None

    @classmethod
    def _post_process_table_data(cls, rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Cleans up common OCR artifacts in table cells globally.
        """
        cleaned_rows = []
        for row in rows:
            new_row = {}
            for k, v in row.items():
                if isinstance(v, str):
                    # 1. Join newlines
                    cleaned = v.replace('\n', ' ').strip()
                    # 2. Fix double spaces
                    cleaned = re.sub(r'\s+', ' ', cleaned)
                    # 3. Basic OCR cleanup for generic text
                    cleaned = cleaned.replace('|', '').replace('=', '').strip()
                    new_row[k] = cleaned
                else:
                    new_row[k] = v
            if any(new_row.values()): # Skip empty rows
                cleaned_rows.append(new_row)
        return cleaned_rows

    # -------------------------------------------------------------------------
    # Specific Handlers
    # -------------------------------------------------------------------------
    @classmethod
    def _extract_kv_text(cls, cropped_page: Any, region: Dict, dims: tuple) -> Dict[str, Any]:
        results = {}
        w_px, h_px = dims
        fields = region.get('fields', [])
        
        if not fields:
            # Fallback for legacy simple regions
            label = region.get('key_label') or region['name']
            text = cropped_page.extract_text(x_tolerance=0.1, y_tolerance=0.1)
            results[label] = DataParser.parse_value(text, FieldType.TEXT)
            return results

        for field in fields:
            # Relative to region
            fx = (field['x'] / 100.0) * w_px
            fy = (field['y'] / 100.0) * h_px
            fw = (field['w'] / 100.0) * w_px
            fh = (field['h'] / 100.0) * h_px
            
            try:
                sub_crop = cropped_page.crop((fx, fy, fx + fw, fy + fh))
                raw_text = sub_crop.extract_text(x_tolerance=0.1, y_tolerance=0.1)
                # Use dbMap if available, else field name
                key = field.get("dbMap") or field['name']
                results[key] = DataParser.parse_value(raw_text, field.get('type', FieldType.TEXT))
            except Exception:
                key = field.get("dbMap") or field['name']
                results[key] = None
        
        return results

    @classmethod
    def _extract_kv_ocr(cls, cropped_page: Any, region: Dict, dims: tuple, tess_config: str) -> Dict[str, Any]:
        results = {}
        w_px, h_px = dims
        fields = region.get('fields', [])
        
        if not fields:
             img = cropped_page.to_image(resolution=300).original
             processed = cls._preprocess_image(img)
             text = pytesseract.image_to_string(processed, config=tess_config).strip()
             label = region.get('key_label') or region['name']
             results[label] = DataParser.parse_value(text, FieldType.TEXT)
             return results

        # For OCR fields
        full_img = cropped_page.to_image(resolution=300).original
        img_w, img_h = full_img.size
        
        for field in fields:
            fx = (field['x'] / 100.0) * img_w
            fy = (field['y'] / 100.0) * img_h
            fw = (field['w'] / 100.0) * img_w
            fh = (field['h'] / 100.0) * img_h
            
            box = (int(fx), int(fy), int(fx + fw), int(fy + fh))
            sub_img = full_img.crop(box)
            processed = cls._preprocess_image(sub_img)
            
            text = pytesseract.image_to_string(processed, config=tess_config).strip()
            # Use dbMap if available
            key = field.get("dbMap") or field['name']
            results[key] = DataParser.parse_value(text, field.get('type', FieldType.TEXT))

        return results

    @classmethod
    def _extract_table_manual(cls, words: List[Dict], columns: List[Dict], region_width: float, offset_x: float = 0.0) -> List[Dict[str, Any]]:
        """
        Extracts rows based on coordinate binning.
        """
        rows = []
        if not words: return []
        
        columns = sorted(columns, key=lambda c: c['x'])
        
        lines = {}
        for w in words:
            # Simple line grouping
            y = round(w["top"] / 4) * 4
            if y not in lines: lines[y] = []
            lines[y].append(w)
        
        sorted_y = sorted(lines.keys())
        for y in sorted_y:
            line_words = sorted(lines[y], key=lambda w: w["x0"])
            row_data = {col['name']: "" for col in columns}
            
            for w in line_words:
                cx = (w["x0"] + w["x1"]) / 2
                
                matched_col = None
                for i, col in enumerate(columns):
                    # Column X is % of region width. offset_x is region left.
                    col_abs_start = offset_x + (col['x'] / 100.0) * region_width
                    
                    next_col_abs_start = 99999
                    if i < len(columns) - 1:
                        next_col_abs_start = offset_x + (columns[i+1]['x'] / 100.0) * region_width
                    
                    if col_abs_start <= cx < next_col_abs_start:
                        matched_col = col
                        break
                
                if matched_col:
                    row_data[matched_col['name']] = (row_data[matched_col['name']] + " " + w["text"]).strip()
            
            # Check if row has any data
            has_data = any(row_data.values())
            
            if has_data:
                clean_row = {}
                for col in columns:
                    raw = row_data[col['name']]
                    # Apply Data Parser
                    clean_row[col['name']] = DataParser.parse_value(raw, col.get('type', FieldType.TEXT))
                rows.append(clean_row)
        return rows

    @classmethod
    def _extract_table_physical(cls, image: Any, original_words: Optional[List[Dict]] = None) -> List[Dict[str, Any]]:
        """
        Uses img2table to detect grid lines.
        Safe Fallback: if img2table fails, it falls back to Typographic (if words provided).
        """
        if not HAS_OCR: return [{"error": "OCR Required for Physical Grid Strategy"}]
        
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        ocr = TesseractOCR(n_threads=1, lang="ita")
        doc = IMG2TableImage(img_byte_arr)
        
        try:
            extracted_tables = doc.extract_tables(ocr=ocr, implicit_rows=True, borderless_tables=True, min_confidence=50)
            if extracted_tables and len(extracted_tables[0].df.columns) > 1:
                df = extracted_tables[0].df
                df = df.fillna("")
                return df.to_dict(orient='records')
            
            # FALLBACK: If img2table found nothing or just 1 column (likely a mistake), 
            # and we have words, use Typographic
            if original_words:
                return cls._extract_table_typographic(original_words)
                
        except Exception:
            if original_words:
                return cls._extract_table_typographic(original_words)
            
        return []

    @classmethod
    def _extract_table_typographic(cls, words: List[Dict]) -> List[Dict[str, Any]]:
        """
        Extracts table data based on typographic clustering.
        1. Groups words into lines.
        2. Automatically detects column gaps across all lines.
        3. Bins words into detected columns.
        """
        if not words: return []
        
        # 1. Group words into lines
        sorted_words = sorted(words, key=lambda w: w["top"])
        lines = []
        current_line = []
        Y_THRESHOLD = 10 
        
        if sorted_words:
            current_line.append(sorted_words[0])
            last_top = sorted_words[0]["top"]
            for w in sorted_words[1:]:
                if abs(w["top"] - last_top) < Y_THRESHOLD:
                    current_line.append(w)
                else:
                    current_line.sort(key=lambda w: w["x0"])
                    lines.append(current_line)
                    current_line = [w]
                last_top = w["top"]
            if current_line:
                current_line.sort(key=lambda w: w["x0"])
                lines.append(current_line)
        
        # 2. Identify Column Gaps (Horizontal whitespace detection)
        all_x0 = [w['x0'] for w in words]
        all_x1 = [w['x1'] for w in words]
        min_x = min(all_x0)
        max_x = max(all_x1)
        width = int(max_x - min_x) + 1
        occupancy = [0] * width
        
        for w in words:
            start = int(max(0, w['x0'] - min_x))
            end = int(min(width - 1, w['x1'] - min_x))
            for i in range(start, end + 1):
                occupancy[i] += 1
        
        gaps = []
        in_gap = False
        gap_start = 0
        # Increase gap width to 20px to avoid splitting headers like "Ora entrata"
        MIN_GAP_WIDTH = 20 
        
        for i in range(width):
            if occupancy[i] == 0:
                if not in_gap:
                    in_gap = True
                    gap_start = i
            else:
                if in_gap:
                    in_gap = False
                    if (i - gap_start) >= MIN_GAP_WIDTH:
                        gaps.append((gap_start + min_x, i + min_x))
        
        # Create contiguous column boundaries using gap mid-points
        col_boundaries = []
        if not gaps:
            col_boundaries = [(min_x, max_x)]
        else:
            col_boundaries.append((min_x - 5, (gaps[0][0] + gaps[0][1]) / 2))
            for i in range(len(gaps) - 1):
                col_boundaries.append(((gaps[i][0] + gaps[i][1]) / 2, (gaps[i+1][0] + gaps[i+1][1]) / 2))
            col_boundaries.append(((gaps[-1][0] + gaps[-1][1]) / 2, max_x + 5))
            
        # 3. Bin words into columns
        rows = []
        for line in lines:
            row_data = {}
            for i, (c_start, c_end) in enumerate(col_boundaries):
                cell_words = [w["text"] for w in line if c_start <= (w["x0"] + w["x1"])/2 <= c_end]
                row_data[f"Col {i+1}"] = " ".join(cell_words).strip()
            
            if any(row_data.values()):
                rows.append(row_data)
        
        return rows

    # -------------------------------------------------------------------------
    # Helpers (OCR, Conditions)
    # -------------------------------------------------------------------------
    @classmethod
    def _preprocess_image(cls, image: Any) -> Any:
        if not HAS_OCR: return image
        try:
            # 1. Initial 2x Scale
            w, h = image.size
            image = image.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
            img_np = np.array(image)
            
            # Convert to Grayscale
            if len(img_np.shape) == 3:
                gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_np

            # 2. Denoising
            denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

            # 3. Contrast Enhancement (CLAHE)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            contrast = clahe.apply(denoised)

            # 4. Deskewing (Rotation Correction)
            coords = np.column_stack(np.where(contrast < 127))
            angle = 0
            if len(coords) > 0:
                angle = cv2.minAreaRect(coords)[-1]
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                
                # Only rotate if tilt is significant but not extreme
                if 0.5 < abs(angle) < 15:
                    (h, w) = contrast.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    contrast = cv2.warpAffine(contrast, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

            # 5. Thresholding
            binary = cv2.adaptiveThreshold(contrast, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            
            return Image.fromarray(binary)
        except Exception as e:
            print(f"Preprocessing failed: {e}")
            return image

    @classmethod
    def _get_tesseract_config(cls, region_type: str, user_psm: Optional[int] = None, lang: str = "ita") -> str:
        base_config = f"--oem 1 -l {lang}"
        if user_psm is not None: return f"{base_config} --psm {user_psm}"
        if region_type == 'table_cell': return f"{base_config} --psm 7"
        elif region_type == 'key_value': return f"{base_config} --psm 6"
        elif region_type == 'text': return f"{base_config} --psm 6"
        return f"{base_config} --psm 3"

    @classmethod
    def _get_ocr_words(cls, image: Any, offset_x: float = 0, offset_y: float = 0) -> List[Dict[str, Any]]:
        if not HAS_OCR: return []
        processed_img = cls._preprocess_image(image)
        data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT, config='--psm 3 --oem 1')
        
        # Scale factor must match _preprocess_image upscale (2x)
        scale = 2.0
        
        words = []
        n_boxes = len(data['text'])
        for i in range(n_boxes):
            if int(data['conf'][i]) > 0 and data['text'][i].strip():
                # Divide coordinates by scale to return to original space
                x = (data['left'][i] / scale) + offset_x
                y = (data['top'][i] / scale) + offset_y
                w = (data['width'][i] / scale)
                h = (data['height'][i] / scale)
                words.append({
                    "x0": x, "top": y,
                    "x1": x + w, "bottom": y + h,
                    "text": data['text'][i]
                })
        return words

    # -------------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------------
    @classmethod
    def preview(cls, file_path: str, config: Dict[str, Any], page_num: int = 0) -> Dict[str, Any]:
        config = cls._normalize_config(config)
        extracted_data = {}
        debug_image_b64 = None
        
        stages = config.get("stages", [])
        active_stage_id = config.get("active_stage_id")
        
        regions = []
        if stages:
            stage = next((s for s in stages if s['id'] == active_stage_id), stages[0])
            regions = stage.get("regions", [])
        else:
            regions = config.get("regions", []) # Fallback (should be covered by normalize)

        with pdfplumber.open(file_path) as pdf:
            if page_num >= len(pdf.pages):
                return {"error": "Page index out of range"}
                
            page = pdf.pages[page_num]
            width, height = page.width, page.height
            
            # Extract
            for region in regions:
                data = cls._extract_region(page, region, (width, height))
                extracted_data[region['name']] = data

            # Debug Image
            try:
                im = page.to_image(resolution=150)
                
                for region in regions:
                    x0 = (region['x'] / 100.0) * width
                    top = (region['y'] / 100.0) * height
                    w_px = (region['w'] / 100.0) * width
                    h_px = (region['h'] / 100.0) * height
                    x1 = x0 + w_px
                    bottom = top + h_px
                    
                    method = region.get("extractionMethod", "text")
                    color = "orange" if method == "ocr" else "blue"
                    if region['type'] == 'table': color = "green"
                    
                    im.draw_rect((x0, top, x1, bottom), fill=None, stroke=color, stroke_width=3)
                    
                    # Draw Sub-elements
                    if region['type'] == 'table' and region.get('tableStrategy') == TableStrategy.MANUAL:
                         for col in region.get('columns', []):
                            cx = (region['x'] / 100.0) * width + (col.get('x', 0) / 100.0) * w_px
                            im.draw_line([(cx, top), (cx, bottom)], stroke="purple", stroke_width=2)
                            
                    if region['type'] == 'key_value' and region.get('fields'):
                        for field in region['fields']:
                            fx = x0 + (field['x'] / 100.0) * w_px
                            ftop = top + (field['y'] / 100.0) * h_px
                            fw = (field['w'] / 100.0) * w_px
                            fh = (field['h'] / 100.0) * h_px
                            im.draw_rect((fx, ftop, fx+fw, ftop+fh), stroke="cyan", stroke_width=1)

                buffer = BytesIO()
                im.save(buffer, format="PNG")
                debug_image_b64 = base64.b64encode(buffer.getvalue()).decode()
            except Exception as e:
                print(f"Debug image gen failed: {e}")

        return {
            "extracted_data": extracted_data,
            "debug_image": debug_image_b64,
            "page_count": len(pdf.pages)
        }

    @classmethod
    def parse(cls, file_path: str, config: Dict[str, Any]) -> Dict[str, Any]:
        config = cls._normalize_config(config)
        results = {}
        stages = config.get("stages", [])
        current_stage_id = config.get("start_stage_id") or stages[0]["id"]

        with pdfplumber.open(file_path) as pdf:
            width, height = pdf.pages[0].width, pdf.pages[0].height
            
            for page_idx, page in enumerate(pdf.pages):
                current_stage = next((s for s in stages if s["id"] == current_stage_id), None)
                if not current_stage: break # Should not happen

                for region in current_stage.get("regions", []):
                    # Check Page Scope
                    scope = region.get("pageTarget", "all")
                    if scope == "first" and page_idx != 0: continue
                    if scope == "last" and page_idx != len(pdf.pages) - 1: continue
                    # Regex/Custom scope could be added here
                    
                    data = cls._extract_region(page, region, (width, height))
                    name = region['name']
                    
                    if data:
                        if isinstance(data, list):
                            if name not in results: results[name] = []
                            results[name].extend(data)
                        elif isinstance(data, dict) and not "_warning" in data:
                             # Merge dicts
                            if name not in results: results[name] = {}
                            results[name].update(data)
                        else:
                            # Scalar or Warning
                            if name not in results: results[name] = data
                            else: 
                                # If multiple scalars on multiple pages, maybe make list? 
                                # For now, legacy behavior: overwrite or append string
                                results[name] = data

                # Transitions
                page_text = page.extract_text() or ""
                for trans in current_stage.get("transitions", []):
                    if cls._check_condition(trans, page_idx, page_text):
                        if trans["action"] == "stop": return results
                        elif trans["action"] == "next_stage":
                            current_stage_id = trans["targetId"]
                            break
                        # next_template logic would be at service level, generic parser just handles this file
            
        return results

    @staticmethod
    def _check_condition(trans: Dict, page_idx: int, page_text: str) -> bool:
        cond = trans["condition"]
        val = trans["value"]
        if cond == "always": return True
        if cond == "text": return val.lower() in page_text.lower()
        if cond == "regex":
            try: return bool(re.search(val, page_text, re.IGNORECASE))
            except Exception: return False
        if cond == "index": return str(page_idx) == str(val)
        return FalseØØ *cascade08ØØ¥Û*cascade08¥ÛËë *cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2Zfile:///c:/Users/Admin/Documents/Coding/OpenLedger/backend/app/services/parsers/generic.py:2file:///c:/Users/Admin/Documents/Coding/OpenLedger