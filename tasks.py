from celery import Celery
from app.database import SessionLocal
from app.models import SearchResult, SearchRun, ReportLog, ReportSetting
from app.scraper import RetailerScraper
from app.mailer import send_report_email
from dotenv import load_dotenv
import os

load_dotenv()
celery_app = Celery("hasbro", broker=os.getenv("REDIS_URL"))

@celery_app.task(bind=True)
def run_search(self, run_id: int, name: str, ean: str, sku: str,
               code: str, map_price: float, retailers: list, min_relevance: float):
    db = SessionLocal()
    scraper = RetailerScraper()

    def save_result(item):
        result = SearchResult(
            run_id=run_id,
            retailer=item.retailer,
            name_found=item.name,
            price=item.price,
            seller=item.seller,
            url=item.url,
            relevance=item.relevance,
            query_type=item.query_type,
            query_value=item.query_value,
            captured_at=item.timestamp,
        )
        db.add(result)
        db.commit()

    try:
        scraper.search_all(
            product_name=name, ean=ean, sku=sku, code=code,
            active_retailers=retailers,
            min_relevance=min_relevance,
            progress_cb=lambda msg: self.update_state(state="PROGRESS", meta={"msg": msg}),
            result_cb=save_result,
            close_after=True,
        )
    finally:
        db.close()

@celery_app.task
def send_weekly_report():
    db = SessionLocal()
    settings = db.query(ReportSetting).filter_by(send_weekly=True).all()
    for s in settings:
        send_report_email(s.recipient_email, db)
        db.add(ReportLog(message=f"Relatório semanal enviado para {s.recipient_email}"))
    db.commit()
    db.close()