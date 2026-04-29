from sqlalchemy.orm import Session
from app import models, schemas

def get_products(db: Session):
    return db.query(models.Product).filter_by(active=True).all()

def get_products_by_ids(db: Session, ids: list):
    return db.query(models.Product).filter(models.Product.id.in_(ids)).all()

def create_product(db: Session, data: schemas.ProductCreate):
    p = models.Product(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def delete_product(db: Session, product_id: int):
    p = db.query(models.Product).get(product_id)
    if p:
        p.active = False
        db.commit()

def create_run(db: Session, run_type: str):
    run = models.SearchRun(run_type=run_type)
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

def count_results(db: Session, run_id: int):
    return db.query(models.SearchResult).filter_by(run_id=run_id).count()

def get_results(db: Session, run_id: int):
    return db.query(models.SearchResult).filter_by(run_id=run_id).all()

def upsert_report_setting(db: Session, data: schemas.ReportSettingCreate):
    s = db.query(models.ReportSetting).first()
    if s:
        s.recipient_email = data.recipient_email
        s.send_weekly = data.send_weekly
        s.weekday = data.weekday
    else:
        s = models.ReportSetting(**data.model_dump())
        db.add(s)
    db.commit()

def get_report_logs(db: Session):
    return db.query(models.ReportLog).order_by(
        models.ReportLog.created_at.desc()
    ).limit(50).all()
