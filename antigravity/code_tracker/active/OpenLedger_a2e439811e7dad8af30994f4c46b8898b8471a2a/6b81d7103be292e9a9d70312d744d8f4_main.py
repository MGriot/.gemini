‡­from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List
import uvicorn
import shutil
import os
import logging
import datetime
import pandas as pd
import pdfplumber

from app.services.parsers import ParserFactory
from app.services.parsers.itt_salary import ITTSalaryParser
from app.core.database import engine, get_db, SQLALCHEMY_DATABASE_URL
from app.models.transaction import Base, Transaction
from app.models.salary import Salary, SalaryItem, SalaryLeave, FiscalData, Attendance
from app.models.settings import SystemSetting
from app.core.utils import sanitize_data

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Connecting to database at: {SQLALCHEMY_DATABASE_URL}")

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoneyMinder Analytics API", version="0.3.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.services.parsers.generic import GenericPDFParser
from app.services.template_manager import TemplateManager
import json

@app.post("/api/parsers/preview")
async def preview_parser_template(
    file: UploadFile = File(...),
    config: str = Form(...),
    page: int = Form(0)
):
    try:
        config_dict = json.loads(config)
        
        # Save temp file
        temp_path = f"data/uploads/temp_preview_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = GenericPDFParser.preview(temp_path, config_dict, page_num=page)
        
        # Cleanup (optional, keeping for debug for now)
        # os.remove(temp_path)
        
        return result
    except Exception as e:
        logger.error(f"Preview Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/parsers/templates")
async def get_parser_templates():
    return TemplateManager.get_all()

@app.post("/api/parsers/templates")
async def save_parser_template(template: dict):
    try:
        return TemplateManager.save(template)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/parsers/templates/{template_id}")
async def delete_parser_template(template_id: str):
    if TemplateManager.delete(template_id):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Template not found")

@app.post("/api/upload")
async def upload_documents(
    files: List[UploadFile] = File(...), 
    doc_type: str = Form(...), 
    source: str = Form("sanpaolo"), 
    dry_run: bool = Form(False),
    parser_name: str = Form(None),
    db: Session = Depends(get_db)
):
    os.makedirs("data/uploads", exist_ok=True)
    results = []
    
    # Determine parser to use
    selected_source = parser_name if parser_name else source

    for file in files:
        # Save to temp path for processing (even for dry run, we need to read it)
        # For dry run, we might want to clean it up later, but for now keeping it in uploads is fine for debugging/staging
        file_path = f"data/uploads/{'preview_' if dry_run else ''}{file.filename}"
        
        # Reset cursor to start just in case
        await file.seek(0)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Generate Snippet
        original_snippet = ""
        try:
            if file.filename.lower().endswith(('.csv', '.txt')):
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    original_snippet = "".join([f.readline() for _ in range(35)])
            elif file.filename.lower().endswith(('.xlsx', '.xls')):
                # Read raw excel data (no header assumption to show true raw state)
                df_snippet = pd.read_excel(file_path, nrows=35, header=None)
                # Convert to string table for preview
                original_snippet = df_snippet.to_string(index=False, header=False, na_rep="")
            elif file.filename.lower().endswith('.pdf'):
                with pdfplumber.open(file_path) as pdf:
                    first_page = pdf.pages[0]
                    text = first_page.extract_text()
                    if text:
                        lines = text.split('\n')
                        original_snippet = "\n".join(lines[:35])
                    else:
                        original_snippet = "[PDF Content - No Text Extracted]"
        except Exception as e:
            original_snippet = f"[Error reading file snippet: {str(e)}]"
        
        try:
            if doc_type == "statement":
                # Use specific parser if provided, else fallback or auto-detect logic
                actual_source = "csv" if file.filename.endswith('.csv') and selected_source == "sanpaolo" else selected_source
                
                # Special handling for explicit parsers
                if parser_name and parser_name != "auto":
                    actual_source = parser_name
                elif file.filename.endswith('.csv') and not parser_name:
                     actual_source = "csv" # Fallback legacy
                
                parsed_transactions = []
                bank_display_name = actual_source

                try:
                    # 1. Try Factory (Hardcoded Parsers)
                    parser = ParserFactory.get_parser(actual_source)
                    parsed_transactions = parser.parse(file_path)
                    bank_display_name = parser.bank_name
                except ValueError:
                    # 2. Try Template Manager (Custom Parsers)
                    template = TemplateManager.get_by_id(actual_source)
                    if template:
                        raw_result = GenericPDFParser.parse(file_path, template)
                        # Flatten results: collect all lists (tables) into one list
                        for val in raw_result.values():
                            if isinstance(val, list):
                                parsed_transactions.extend(val)
                        bank_display_name = template["name"]
                    else:
                        # Fallback to generic CSV if nothing matches
                        parser = ParserFactory.get_parser("csv")
                        parsed_transactions = parser.parse(file_path)
                        bank_display_name = parser.bank_name

                if dry_run:
                    # Return preview data
                    results.append({
                        "filename": file.filename,
                        "status": "preview",
                        "parser_used": bank_display_name,
                        "original_snippet": original_snippet,
                        "parsed_preview": parsed_transactions[:5], 
                        "total_parsed": len(parsed_transactions)
                    })
                else:
                    # Commit to DB
                    count = 0
                    for t in parsed_transactions:
                        # Deduplication check
                        exists = db.query(Transaction).filter(
                            Transaction.date == t["date"],
                            Transaction.amount == t["amount"],
                            Transaction.operation == t["operation"],
                            Transaction.details == t.get("details", "")
                        ).first()
                        
                        if not exists:
                            tx_data = {k: v for k, v in t.items() if hasattr(Transaction, k)}
                            db.add(Transaction(**tx_data))
                            count += 1
                    db.commit()
                    results.append({"filename": file.filename, "status": "success", "rows": count, "parser_used": bank_display_name})

            elif doc_type == "salary":
                # Check for explicit parser/template (Generic Pipeline)
                use_generic = False
                template = None
                
                logger.info(f"Processing Salary Upload. Parser Name: {parser_name}")
                if parser_name and parser_name not in ["itt_salary", "auto", "default"]:
                    template = TemplateManager.get_by_id(parser_name)
                    logger.info(f"Template Lookup: {template is not None}")
                    if template:
                        use_generic = True
                
                if use_generic:
                    # Generic Parser Logic
                    raw_result = GenericPDFParser.parse(file_path, template)
                    
                    if dry_run:
                        # Flatten for preview
                        preview_items = []
                        for k, v in raw_result.items():
                            if isinstance(v, list):
                                preview_items.append({"date": "Table", "operation": k, "amount": len(v), "details": "rows"})
                            else:
                                preview_items.append({"date": k, "operation": str(v), "amount": 0, "details": ""})
                                
                        results.append({
                            "filename": file.filename,
                            "status": "preview",
                            "parser_used": template["name"],
                            "original_snippet": original_snippet,
                            "parsed_preview": preview_items,
                            "total_parsed": len(raw_result)
                        })
                    else:
                        # Map to Salary Schema
                        # Minimum Requirements: date, net_income
                        parsed_date = datetime.date.today()
                        # Try to find date
                        for k, v in raw_result.items():
                            if k.lower() in ["date", "data", "periodo", "month_reference"]:
                                 try:
                                    if isinstance(v, str): 
                                        # Simple heuristic for YYYY-MM-DD
                                        parsed_date = datetime.datetime.strptime(v, "%Y-%m-%d").date()
                                    elif isinstance(v, datetime.date): 
                                        parsed_date = v
                                 except: pass
    
                        parsed_net = 0.0
                        
                        # 1. Priority: Explicit DB Mapping
                        if "net_income" in raw_result:
                            try:
                                v = raw_result["net_income"]
                                if isinstance(v, (int, float)): parsed_net = float(v)
                                elif isinstance(v, str):
                                    # Handle Euro format 1.234,56 -> 1234.56
                                    # Or US format 1,234.56 -> 1234.56
                                    # Simple approach for now: remove dots, repl comma with dot (European standard for this context)
                                    clean_val = v.replace('.','').replace(',','.')
                                    parsed_net = float(clean_val)
                            except: pass
                        
                        # 2. Fallback: Heuristic Search
                        if parsed_net == 0.0:
                            for k, v in raw_result.items():
                                 if k.lower() in ["netto", "net", "netto a pagare", "net pay"]:
                                     try:
                                        if isinstance(v, (int, float)): parsed_net = float(v)
                                        elif isinstance(v, str): 
                                            clean_val = v.replace('.','').replace(',','.')
                                            parsed_net = float(clean_val)
                                     except: pass

                        salary_entry = Salary(
                            date=parsed_date,
                            net_income=parsed_net,
                            filename=file.filename,
                            raw_data=raw_result
                        )
                        db.add(salary_entry)
                        db.commit()
                        results.append({"filename": file.filename, "status": "success", "parser_used": template["name"]})

                else:
                    # Legacy ITT Parser (Fallback)
                    data = ITTSalaryParser.parse(file_path)
                    
                    if dry_run:
                         # Transform items for preview table compatibility
                        preview_items = []
                        for item in data.get("items", []):
                            amt = item.get("earnings", 0) - item.get("deductions", 0)
                            preview_items.append({
                                "date": data.get("month_reference", ""),
                                "operation": f"{item['code']} - {item['description']}",
                                "amount": amt,
                                "details": item.get("details", "")
                            })
    
                        results.append({
                            "filename": file.filename,
                            "status": "preview",
                            "parser_used": "itt_salary",
                            "original_snippet": original_snippet,
                            "parsed_preview": preview_items, 
                            "total_parsed": len(preview_items)
                        })
                    else:
                        # Relational storage
                        items_data = data.pop("items")
                        leaves_data = data.pop("leaves")
                        fiscal_data = data.pop("fiscal_data")
                        attendance_data = data.pop("attendance")
                        
                        salary_entry = Salary(filename=file.filename, **data)
                        db.add(salary_entry)
                        db.flush() # Get the ID
                        
                        for item in items_data:
                            db.add(SalaryItem(salary_id=salary_entry.id, **item))
                        for leave in leaves_data:
                            db.add(SalaryLeave(salary_id=salary_entry.id, **leave))
                        
                        if fiscal_data:
                            db.add(FiscalData(salary_id=salary_entry.id, **fiscal_data))
                            
                        for att in attendance_data:
                            db.add(Attendance(salary_id=salary_entry.id, **att))
                        
                        db.commit()
                        results.append({"filename": file.filename, "status": "success", "parser_used": "itt_salary"})
                
        except Exception as e:
            if not dry_run: db.rollback()
            logger.error(f"Error: {str(e)}")
            results.append({"filename": file.filename, "status": "error", "message": str(e)})

    return {"status": "completed", "results": results}

@app.get("/api/transactions")
async def get_transactions(db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.date.desc()).all()
    return sanitize_data([ {column.name: getattr(tx, column.name) for column in tx.__table__.columns} for tx in txs ])

@app.post("/api/transactions")
async def create_transaction(data: dict, db: Session = Depends(get_db)):
    if "date" in data and isinstance(data["date"], str):
        data["date"] = datetime.datetime.strptime(data["date"], "%Y-%m-%d").date()
    tx = Transaction(**data)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return sanitize_data({column.name: getattr(tx, column.name) for column in tx.__table__.columns})

@app.put("/api/transactions/{tx_id}")
async def update_transaction(tx_id: int, data: dict, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Fields that should not be manually updated as strings
    protected_fields = ["id", "created_at"]
    
    for key, value in data.items():
        if key in protected_fields:
            continue
            
        if key == "date" and isinstance(value, str):
            value = datetime.datetime.strptime(value, "%Y-%m-%d").date()
            
        if hasattr(tx, key):
            setattr(tx, key, value)
            
    db.commit()
    db.refresh(tx)
    return sanitize_data({column.name: getattr(tx, column.name) for column in tx.__table__.columns})

@app.delete("/api/transactions/{tx_id}")
async def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"status": "success"}

@app.delete("/api/salaries/{salary_id}")
async def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    sal = db.query(Salary).filter(Salary.id == salary_id).first()
    if not sal:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(sal)
    db.commit()
    return {"status": "success"}

@app.get("/api/salaries")
async def get_salaries(db: Session = Depends(get_db)):
    # Eager load relationships for detail view
    salaries = db.query(Salary).options(
        joinedload(Salary.items), 
        joinedload(Salary.leaves),
        joinedload(Salary.fiscal_data),
        joinedload(Salary.attendance)
    ).order_by(Salary.date.desc()).all()
    
    data = []
    for s in salaries:
        s_dict = {column.name: getattr(s, column.name) for column in s.__table__.columns}
        s_dict["items"] = [ {c.name: getattr(i, c.name) for c in i.__table__.columns} for i in s.items ]
        s_dict["leaves"] = [ {c.name: getattr(l, c.name) for c in l.__table__.columns} for l in s.leaves ]
        if s.fiscal_data:
            s_dict["fiscal_data"] = {c.name: getattr(s.fiscal_data, c.name) for c in s.fiscal_data.__table__.columns}
        if s.attendance:
            s_dict["attendance"] = [ {c.name: getattr(a, c.name) for c in a.__table__.columns} for a in s.attendance ]
        data.append(s_dict)
        
    return sanitize_data(data)

@app.get("/api/system/duplicates")
async def get_duplicates(db: Session = Depends(get_db)):
    from sqlalchemy import func
    # Group by key fields and find those with count > 1
    duplicate_groups = db.query(
        Transaction.date, 
        Transaction.amount, 
        Transaction.operation, 
        Transaction.details
    ).group_by(
        Transaction.date, 
        Transaction.amount, 
        Transaction.operation, 
        Transaction.details
    ).having(func.count(Transaction.id) > 1).all()
    
    results = []
    for g in duplicate_groups:
        items = db.query(Transaction).filter(
            Transaction.date == g.date,
            Transaction.amount == g.amount,
            Transaction.operation == g.operation,
            Transaction.details == g.details
        ).all()
        results.append({
            "info": {"date": str(g.date), "amount": g.amount, "operation": g.operation},
            "records": [ {column.name: getattr(tx, column.name) for column in tx.__table__.columns} for tx in items ]
        })
    return sanitize_data(results)

@app.post("/api/system/deduplicate")
async def deduplicate_transactions(db: Session = Depends(get_db)):
    from sqlalchemy import func, select
    subq = db.query(func.min(Transaction.id)).group_by(
        Transaction.date, 
        Transaction.amount, 
        Transaction.operation, 
        Transaction.details, 
        Transaction.account_id
    ).scalar_subquery()
    
    deleted = db.query(Transaction).filter(Transaction.id.notin_(select(subq))).delete(synchronize_session=False)
    db.commit()
    return {"deleted_count": deleted}

@app.get("/api/settings/categories")
async def get_category_presets(db: Session = Depends(get_db)):
    user_cat_file = "data/user_categories.json"
    default_cat_file = "data/categories.json"
    
    # 1. Try user overrides first
    if os.path.exists(user_cat_file):
        try:
            import json
            with open(user_cat_file, 'r') as f:
                return json.load(f)
        except Exception:
            pass

    # 2. Try factory defaults
    if os.path.exists(default_cat_file):
        try:
            import json
            with open(default_cat_file, 'r') as f:
                return json.load(f)
        except Exception:
            pass

    # 3. Ultimate fallback
    return {
        "Housing": {"Rent": []}, 
        "Income": {"Salary": []}, 
        "Miscellaneous": {"Uncategorized": []}
    }

@app.post("/api/settings/categories")
async def save_category_presets(data: dict):
    user_cat_file = "data/user_categories.json"
    try:
        import json
        with open(user_cat_file, 'w') as f:
            json.dump(data, f, indent=2)
        return {"status": "success", "message": "Preferences saved to user profile."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save categories: {str(e)}")

@app.delete("/api/system/reset")
async def reset_database(db: Session = Depends(get_db)):
    db.query(Transaction).delete(); db.query(Salary).delete(); db.commit()
    return {"status": "success"}

from app.api import analytics
app.include_router(analytics.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
–A *cascade08–AëA*cascade08ëAøB *cascade08øBÄC*cascade08ÄC˜T *cascade08˜T¹T*cascade08¹T»T *cascade08»T¿T*cascade08¿TÀT *cascade08ÀTÈT*cascade08ÈTÉT *cascade08ÉTûT*cascade08ûT‰U *cascade08‰U§U*cascade08§U¨U *cascade08¨UÕU*cascade08ÕUÖU *cascade08ÖUäU*cascade08äUåU *cascade08åUV*cascade08VV *cascade08V–V*cascade08–V—V *cascade08—V¦V*cascade08¦V¨V *cascade08¨V¾V*cascade08¾VÜV *cascade08ÜVáV*cascade08áVäV *cascade08äVÁW*cascade08ÁWÂW *cascade08ÂW¶X*cascade08¶X·X *cascade08·XÇX*cascade08ÇXÉX *cascade08ÉXÌX*cascade08ÌXÍX *cascade08ÍXØX*cascade08ØXÙX *cascade08ÙXìX*cascade08ìXíX *cascade08íXşX*cascade08şXÿX *cascade08ÿX…Y*cascade08…Y†Y *cascade08†YŠY*cascade08ŠY‹Y *cascade08‹Y‘Y*cascade08‘Y’Y *cascade08’YZ*cascade08Z’Z *cascade08’Z Z*cascade08 Z¡Z *cascade08¡Z“[*cascade08“[”[ *cascade08”[Â[*cascade08Â[Ã[ *cascade08Ã[ë[*cascade08ë[ì[ *cascade08ì[„\*cascade08„\…\ *cascade08…\³\*cascade08³\´\ *cascade08´\º\*cascade08º\»\ *cascade08»\¼\*cascade08¼\ê\ *cascade08ê\ë\*cascade08ë\Œ] *cascade08Œ]]*cascade08]”] *cascade08”]˜]*cascade08˜]ò] *cascade08ò]ó]*cascade08ó]—^ *cascade08—^š^*cascade08š^´^ *cascade08´^¸^*cascade08¸^·_ *cascade08·_»_*cascade08»_Ù_ *cascade08Ù_İ_*cascade08İ_ ˆ *cascade08 ˆòŠ*cascade08òŠ‡­ *cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2Ffile:///c:/Users/Admin/Documents/Coding/OpenLedger/backend/app/main.py:2file:///c:/Users/Admin/Documents/Coding/OpenLedger