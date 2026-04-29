import os
from dotenv import load_dotenv

load_dotenv()

from celery import Celery
from app.database import SessionLocal
from app.models import SearchResult, SearchRun, ReportLog, ReportSetting

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "hasbro",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/Sao_Paulo",
    enable_utc=True,
)


@celery_app.task(bind=True)
def run_search(
    self,
    run_id: int,
    name: str,
    ean: str,
    sku: str,
    code: str,
    map_price: float,
    retailers: list,
    min_relevance: float,
):
    from app.scraper import RetailerScraper

    db = SessionLocal()
    scraper = RetailerScraper()

    def save_result(item):
        try:
            result = SearchResult(
                run_id=run_id,
                retailer=item.retailer,
                name_found=item.name or "—",
                price=item.price,
                seller=item.seller or "",
                url=item.url or "",
                relevance=round(item.relevance, 3),
                query_type=item.query_type,
                query_value=item.query_value,
                captured_at=item.timestamp,
            )
            db.add(result)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[TASK] Erro ao salvar resultado: {e}")

    try:
        scraper.search_all(
            product_name=name,
            ean=ean,
            sku=sku,
            code=code,
            active_retailers=retailers,
            min_relevance=min_relevance,
            progress_cb=lambda msg: self.update_state(
                state="PROGRESS", meta={"msg": msg}
            ),
            result_cb=save_result,
            close_after=True,
        )
    except Exception as e:
        print(f"[TASK] Erro no scraping: {e}")
    finally:
        db.close()


@celery_app.task
def send_weekly_report():
    from app.mailer import send_report_email

    db = SessionLocal()
    try:
        settings = db.query(ReportSetting).filter_by(send_weekly=True).all()
        for s in settings:
            try:
                send_report_email(s.recipient_email, db)
                db.add(ReportLog(
                    message=f"Relatório semanal enviado para {s.recipient_email}"
                ))
                db.commit()
            except Exception as e:
                print(f"[TASK] Erro ao enviar email para {s.recipient_email}: {e}")
    finally:
        db.close()
