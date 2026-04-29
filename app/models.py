from sqlalchemy import (
    Column, Integer, String, Numeric,
    DateTime, Boolean, Text, ForeignKey
)
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    ean        = Column(String(20),  nullable=True)
    sku        = Column(String(20),  nullable=True)
    code       = Column(String(30),  nullable=True)
    map_price  = Column(Numeric(10, 2), nullable=True)
    active     = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class SearchRun(Base):
    __tablename__ = "search_runs"

    id         = Column(Integer, primary_key=True, index=True)
    run_type   = Column(String(20), nullable=False)  # "single" ou "bulk"
    created_at = Column(DateTime, server_default=func.now())


class SearchResult(Base):
    __tablename__ = "search_results"

    id          = Column(Integer, primary_key=True, index=True)
    run_id      = Column(Integer, ForeignKey("search_runs.id"), nullable=False)
    product_id  = Column(Integer, ForeignKey("products.id"),    nullable=True)
    retailer    = Column(String(50),  nullable=False)
    name_found  = Column(String(500), nullable=False)
    price       = Column(Numeric(10, 2), nullable=True)
    seller      = Column(String(255),    nullable=True)
    url         = Column(Text,           nullable=True)
    relevance   = Column(Numeric(4, 3),  nullable=False, default=0)
    query_type  = Column(String(20),  nullable=True)
    query_value = Column(String(255), nullable=True)
    captured_at = Column(String(30),  nullable=True)
    created_at  = Column(DateTime, server_default=func.now())


class ReportSetting(Base):
    __tablename__ = "report_settings"

    id              = Column(Integer, primary_key=True, index=True)
    recipient_email = Column(String(255), nullable=False)
    send_weekly     = Column(Boolean, default=True)
    weekday         = Column(Integer, default=1)   # 1 = segunda-feira
    created_at      = Column(DateTime, server_default=func.now())


class ReportLog(Base):
    __tablename__ = "report_logs"

    id         = Column(Integer, primary_key=True, index=True)
    message    = Column(String(500), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
