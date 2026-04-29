from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db, engine
from app import models, schemas, crud
from typing import List

# Cria as tabelas automaticamente no primeiro deploy
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hasbro Price Monitor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "app": "Hasbro Price Monitor"}

@app.get("/health")
def health():
    return {"status": "healthy"}

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

# ── Runs de busca ─────────────────────────────────────
@app.post("/search", response_model=schemas.RunOut)
def start_search(data: schemas.SearchRequest, db: Session = Depends(get_db)):
    run = crud.create_run(db, "single")
    # Celery só ativa se Redis estiver configurado
    try:
        from app.tasks import run_search
        run_search.delay(
            run.id, data.name or "", data.ean or "",
            data.sku or "", data.code or "",
            data.map_price or 0,
            data.retailers, data.min_relevance,
        )
    except Exception as e:
        return {"run_id": run.id, "status": f"queued_error: {str(e)}"}
    return {"run_id": run.id, "status": "queued"}

@app.get("/search/{run_id}/results", response_model=List[schemas.ResultOut])
def search_results(run_id: int, db: Session = Depends(get_db)):
    return crud.get_results(db, run_id)

@app.get("/search/{run_id}/status")
def search_status(run_id: int, db: Session = Depends(get_db)):
    count = crud.count_results(db, run_id)
    return {"run_id": run_id, "results_so_far": count}

# ── Relatórios ────────────────────────────────────────
@app.post("/report-settings")
def save_report_settings(data: schemas.ReportSettingCreate, db: Session = Depends(get_db)):
    crud.upsert_report_setting(db, data)
    return {"ok": True}

@app.get("/report-logs")
def report_logs(db: Session = Depends(get_db)):
    return crud.get_report_logs(db)
