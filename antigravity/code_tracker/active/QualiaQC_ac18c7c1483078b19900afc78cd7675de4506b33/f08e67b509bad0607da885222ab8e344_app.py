Ýl"""
Main GUI application for QualiaQC.
Modular architecture with separate classes for each notebook tab.
"""

import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import argparse
import os
import pickle
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from src.pipeline import run_analysis, Pipeline
from src.project_management.manager import ProjectManager
from src.resource_management.pipeline import InitializationPipeline
from src.reporting.generator import ReportGenerator
from src.config import AUTHOR, DEPARTMENT, REPORT_TITLE
from src.utils.logging_utils import setup_logger

# Import Modular Tabs
from .tabs.analysis_tab import AnalysisTab
from .tabs.history_tab import HistoryTab
from .tabs.project_tab import ProjectTab
from .tabs.dataset_tab import DatasetTab

logger = setup_logger(__name__)

class VisualAnalyzerGUI(tk.Tk):
    def __init__(self, debug_mode=False):
        super().__init__()
        self.debug_mode = debug_mode
        
        # Initialize Global Resources
        init_pipeline = InitializationPipeline()
        init_messages = init_pipeline.run()
        for msg in init_messages:
            logger.info(msg)

        title_suffix = " (DEBUG)" if debug_mode else ""
        self.title(f"QualiaQC - Professional Image Analysis{title_suffix}")
        self.geometry("1000x850")

        self.project_manager = ProjectManager()
        self._setup_vars()
        self._build_menu()

        self.nb = ttk.Notebook(self)
        self.nb.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Tab instances
        self.tab_analysis = AnalysisTab(self.nb, self)
        self.tab_history = HistoryTab(self.nb, self)
        self.tab_project = ProjectTab(self.nb, self)
        self.tab_dataset = DatasetTab(self.nb, self)

        self.nb.add(self.tab_analysis, text="Analysis")
        self.nb.add(self.tab_history, text="History")
        self.nb.add(self.tab_project, text="Projects")
        self.nb.add(self.tab_dataset, text="Dataset")

    def _setup_vars(self):
        self.available_projects = self.project_manager.list_projects()
        self.project_var = tk.StringVar()
        self.image_path_var = tk.StringVar()
        self.part_number_var = tk.StringVar()
        self.thickness_var = tk.StringVar()
        self.author_var = tk.StringVar(value=AUTHOR)
        self.department_var = tk.StringVar(value=DEPARTMENT)
        self.report_title_var = tk.StringVar(value=REPORT_TITLE)
        self.color_checker_path_var = tk.StringVar()
        
        # Standard pipeline options
        self.color_alignment_var = tk.BooleanVar(value=True)
        self.alignment_var = tk.BooleanVar(value=True)
        self.object_alignment_var = tk.BooleanVar(value=True)
        self.apply_mask_var = tk.BooleanVar(value=True)
        self.symmetry_var = tk.BooleanVar(value=True)
        self.blur_var = tk.BooleanVar(value=True)
        self.aggregate_var = tk.BooleanVar(value=True)
        
        self.color_correction_method_var = tk.StringVar(value="linear")
        self.object_alignment_shadow_removal_var = tk.StringVar(value="clahe")
        self.masking_order_var = tk.StringVar(value="1-2-3")
        self.mask_bg_is_white_var = tk.BooleanVar(value=False)
        self.debug_var = tk.BooleanVar(value=self.debug_mode)
        
        # Analysis Parameters
        self.agg_kernel_size_var = tk.StringVar(value="7")
        self.agg_min_area_var = tk.StringVar(value="0.0005")
        self.agg_density_thresh_var = tk.StringVar(value="0.5")
        self.blur_kernel_size_var = tk.StringVar(value="5")
        
        self.new_project_name_var = tk.StringVar()
        self.manage_project_var = tk.StringVar()
        
        self.history_data = []
        self.history_filter_vars = {k: tk.StringVar() for k in ['date', 'project', 'part_number', 'thickness', 'percentage']}

    def _build_menu(self):
        m = tk.Menu(self)
        self.config(menu=m)
        
        file = tk.Menu(m, tearoff=0)
        m.add_cascade(label="File", menu=file)
        file.add_command(label="Exit", command=self.quit)

        tools = tk.Menu(m, tearoff=0)
        m.add_cascade(label="Tools", menu=tools)
        tools.add_command(label="Mask Drawing Editor", command=self._launch_drawing_editor)
        tools.add_command(label="Color Checker Detector", command=lambda: messagebox.showinfo("Info", "Coming soon!"))

    def _launch_drawing_editor(self):
        logger.info("Launching Mask Drawing Editor...")
        import subprocess
        try:
            # Run as a separate process to avoid blocking the main event loop
            subprocess.Popen([".venv/Scripts/python.exe", "-m", "src.gui.drawing.editor"])
        except Exception as e:
            messagebox.showerror("Error", f"Failed to launch editor: {e}")

    def select_image(self):
        path = filedialog.askopenfilename()
        if path:
            self.image_path_var.set(path)
            self._extract_meta(path)

    def _extract_meta(self, path):
        stem = Path(path).stem
        parts = stem.split("_")
        if len(parts) >= 3:
            self.part_number_var.set(parts[2])
            self.thickness_var.set(parts[3] if len(parts) >= 4 else "N/A")
        else:
            self.part_number_var.set(stem)
            self.thickness_var.set("N/A")

    def select_color_checker(self):
        path = filedialog.askopenfilename(title="Select Color Checker Photo")
        if path: self.color_checker_path_var.set(path)

    def run_analysis(self):
        if not self.project_var.get() or not self.image_path_var.get():
            messagebox.showerror("Error", "Project and Image are required.")
            return
        
        try:
            bk = int(self.blur_kernel_size_var.get())
            blur_kernel = [bk, bk]
            
            args = argparse.Namespace(
                project=self.project_var.get(),
                image=self.image_path_var.get(),
                part_number=self.part_number_var.get(),
                thickness=self.thickness_var.get(),
                author=self.author_var.get(),
                department=self.department_var.get(),
                report_title=self.report_title_var.get(),
                debug=self.debug_var.get(),
                color_alignment=self.color_alignment_var.get(),
                color_correction_method=self.color_correction_method_var.get(),
                sample_color_checker=self.color_checker_path_var.get() if self.color_alignment_var.get() else None,
                alignment=self.alignment_var.get(),
                object_alignment=self.object_alignment_var.get(),
                object_alignment_shadow_removal=self.object_alignment_shadow_removal_var.get(),
                apply_mask=self.apply_mask_var.get(),
                mask_bg_is_white=self.mask_bg_is_white_var.get(),
                masking_order=self.masking_order_var.get(),
                symmetry=self.symmetry_var.get(),
                aggregate=self.aggregate_var.get(), 
                agg_kernel_size=int(self.agg_kernel_size_var.get()), 
                agg_min_area=float(self.agg_min_area_var.get()), 
                agg_density_thresh=float(self.agg_density_thresh_var.get()),
                blur=self.blur_var.get(), 
                blur_kernel=blur_kernel,
                skip_color_analysis=False, 
                skip_report_generation=True,
                load_state_from=None, 
                save_state_to=None, 
                video=None, 
                camera=False
            )

            res = run_analysis(args)
            if res:
                self._prompt_save(res)
        except ValueError as e:
            messagebox.showerror("Input Error", f"Invalid numeric parameter: {e}")
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            messagebox.showerror("Error", str(e))

    def _prompt_save(self, pipeline):
        pn = pipeline.metadata.get('part_number', 'report')
        path = filedialog.asksaveasfilename(defaultextension=".pdf", initialfile=f"{pn}_report.pdf")
        if path:
            pipeline.generate_report(external_pdf_path=path)
            messagebox.showinfo("Success", f"Report generated at {path}")

    # --- Archiving / History ---
    def _scan_and_load_history(self):
        logger.info("Scanning history (DB + Legacy)...")
        self.history_data.clear()
        for item in self.history_tree.get_children(): self.history_tree.delete(item)
        
        # 1. Load from DB
        from src.db import SessionLocal
        db = SessionLocal()
        try:
            sessions = self.project_manager.db_manager.list_sessions(db)
            for s in sessions:
                perc = 0.0
                metadata = s.metadata_info or {}
                pn = metadata.get('part_number', 'N/A')
                thick = metadata.get('thickness', 'N/A')
                
                for m in s.metrics:
                    if m.key == "matched_percentage":
                        perc = m.value
                        break
                
                dt_str = s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "N/A"
                self.history_data.append({
                    'id': s.id, 
                    'pn': pn, 
                    'thick': thick, 
                    'perc': perc, 
                    'proj': s.project_name,
                    'is_db': True
                })
                self.history_tree.insert('', 'end', values=(dt_str, s.project_name, pn, thick, f"{perc:.2f}%"))
        except Exception as e:
            logger.error(f"DB History load failed: {e}")
        finally:
            db.close()

        # 2. Legacy Fallback (Pickle files)
        archives = list(Path("output").rglob("*.gri"))
        for p in archives:
            try:
                session_id = p.stem
                # Skip if already in history from DB
                if any(h.get('id') == session_id for h in self.history_data):
                    continue

                with open(p, 'rb') as f:
                    data = pickle.load(f)
                
                # Support both dict and object formats
                if isinstance(data, dict):
                    pn = data.get('metadata', {}).get('part_number', 'Legacy')
                    thick = data.get('metadata', {}).get('thickness', 'N/A')
                    perc = data.get('analysis_results_raw', {}).get('percentage', 0.0)
                    proj = data.get('project_name', 'N/A')
                else:
                    pn = getattr(data, 'metadata', {}).get('part_number', 'Legacy')
                    thick = getattr(data, 'metadata', {}).get('thickness', 'N/A')
                    perc = getattr(data, 'analysis_results', {}).get('percentage', 0.0)
                    proj = getattr(data.args, 'project', 'N/A')

                self.history_data.append({
                    'id': session_id, 
                    'path': p, 
                    'pn': pn, 
                    'thick': thick, 
                    'perc': perc, 
                    'proj': proj,
                    'is_db': False
                })
                dt_str = datetime.fromtimestamp(p.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
                self.history_tree.insert('', 'end', values=(dt_str, proj, pn, thick, f"{perc:.2f}% (Legacy)"))
            except:
                continue
        
        status_msg = f"Found {len(self.history_data)} reports."
        # Update status bar if it exists (AnalysisTab might have one, but app.py doesn't have a global one shown)
        logger.info(status_msg)

    def _on_history_select(self, e):
        self.recreate_button.config(state=tk.NORMAL if self.history_tree.selection() else tk.DISABLED)

    def _recreate_report(self):
        sel = self.history_tree.selection()
        if not sel: return
        idx = self.history_tree.index(sel[0])
        item = self.history_data[idx]
        
        path = filedialog.asksaveasfilename(defaultextension=".pdf", initialfile=f"regenerated_{item['pn']}.pdf")
        if not path: return
        
        try:
            if item.get('is_db'):
                # Database logic
                from src.db import SessionLocal
                db = SessionLocal()
                try:
                    reporting_pipe = ReportingPipeline(
                        project_name=item['proj'],
                        sample_name=None,
                        debug_mode=True
                    )
                    report_data = reporting_pipe.run_from_session(item['id'], db=db)
                    if report_data and "pdf_path" in report_data:
                        # Copy the generated PDF to the user's chosen path
                        shutil.copy2(report_data["pdf_path"], path)
                        messagebox.showinfo("Success", f"Report regenerated at {path}")
                    else:
                        messagebox.showerror("Error", "Report regeneration failed internally.")
                finally:
                    db.close()
            else:
                # Legacy legacy logic
                with open(item['path'], 'rb') as f: data = pickle.load(f)
                if isinstance(data, dict):
                    gen = ReportGenerator(data['project_name'], debug_mode=self.debug_mode)
                    gen.generate_from_archived_data(data, base_dir=item['path'].parent.parent, external_pdf_path=path)
                else:
                    data.generate_report(external_pdf_path=path)
                messagebox.showinfo("Success", f"Report regenerated at {path}")
        except Exception as e: 
            logger.error(f"Report regeneration failed: {e}")
            messagebox.showerror("Error", str(e))

if __name__ == "__main__":
    app = VisualAnalyzerGUI(debug_mode=True)
    app.mainloop()
Ýl"(ac18c7c1483078b19900afc78cd7675de4506b332?file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/gui/app.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC