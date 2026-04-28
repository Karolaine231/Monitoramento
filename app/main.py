from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db, engine
from app import models, schemas, crud
from app.tasks import run_search, celery_app
from celery.result import AsyncResult
from typing import List

models.Base.metadata.create_all(bind=engine)  # cria tabelas se não existirem

app = FastAPI(title="Hasbro Price Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em prod: coloca o domínio do seu frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Produtos ──────────────────────────────────────────
@app.get("/products", response_model=List[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@app.post("/products", response_model=schemas.ProductOut)
def create_product(data: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, data)

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    crud.delete_product(db, product_id)
    return {"ok": True}

# ── Busca ─────────────────────────────────────────────
@app.post("/search", response_model=schemas.RunOut)
def start_search(data: schemas.SearchRequest, db: Session = Depends(get_db)):
    run = crud.create_run(db, "single")
    task = run_search.delay(
        run.id, data.name or "", data.ean or "",
        data.sku or "", data.code or "",
        data.map_price or 0,
        data.retailers, data.min_relevance,
    )
    return {"run_id": run.id, "status": "queued"}

@app.post("/search/bulk", response_model=schemas.RunOut)
def start_bulk_search(data: schemas.BulkSearchRequest, db: Session = Depends(get_db)):
    run = crud.create_run(db, "bulk")
    products = crud.get_products_by_ids(db, data.product_ids)
    for p in products:
        run_search.delay(
            run.id, p.name or "", p.ean or "",
            p.sku or "", p.code or "",
            float(p.map_price or 0),
            data.retailers, data.min_relevance,
        )
    return {"run_id": run.id, "status": "queued"}

@app.get("/search/{run_id}/status")
def search_status(run_id: int, db: Session = Depends(get_db)):
    count = crud.count_results(db, run_id)
    return {"run_id": run_id, "results_so_far": count}

@app.get("/search/{run_id}/results", response_model=List[schemas.ResultOut])
def search_results(run_id: int, db: Session = Depends(get_db)):
    return crud.get_results(db, run_id)

# ── Relatórios ────────────────────────────────────────
@app.post("/report-settings")
def save_report_settings(data: schemas.ReportSettingCreate, db: Session = Depends(get_db)):
    crud.upsert_report_setting(db, data)
    return {"ok": True}

@app.get("/report-logs")
def report_logs(db: Session = Depends(get_db)):
    return crud.get_report_logs(db)