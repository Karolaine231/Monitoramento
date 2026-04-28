from sqlalchemy import Column, Integer, String, Decimal, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    id         = Column(Integer, primary_key=True)
    name       = Column(String(255))
    ean        = Column(String(20))
    sku        = Column(String(20))
    code       = Column(String(30))
    map_price  = Column(Decimal(10, 2))
    active     = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

class SearchRun(Base):
    __tablename__ = "search_runs"
    id         = Column(Integer, primary_key=True)
    run_type   = Column(String(20))  # "single" ou "bulk"
    created_at = Column(DateTime, server_default=func.now())

class SearchResult(Base):
    __tablename__ = "search_results"
    id           = Column(Integer, primary_key=True)
    run_id       = Column(Integer, ForeignKey("search_runs.id"))
    product_id   = Column(Integer, ForeignKey("products.id"), nullable=True)
    retailer     = Column(String(50))
    name_found   = Column(String(500))
    price        = Column(Decimal(10, 2), nullable=True)
    seller       = Column(String(255), nullable=True)
    url          = Column(Text, nullable=True)
    relevance    = Column(Decimal(4, 3))
    query_type   = Column(String(20))
    query_value  = Column(String(255))
    captured_at  = Column(String(30))
    created_at   = Column(DateTime, server_default=func.now())

class ReportSetting(Base):
    __tablename__ = "report_settings"
    id              = Column(Integer, primary_key=True)
    recipient_email = Column(String(255))
    send_weekly     = Column(Boolean, default=True)
    weekday         = Column(Integer, default=1)  # 1=segunda
    created_at      = Column(DateTime, server_default=func.now())

class ReportLog(Base):
    __tablename__ = "report_logs"
    id         = Column(Integer, primary_key=True)
    message    = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())