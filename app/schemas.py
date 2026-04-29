from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class ProductCreate(BaseModel):
    name:      str
    ean:       Optional[str]   = None
    sku:       Optional[str]   = None
    code:      Optional[str]   = None
    map_price: Optional[float] = None


class ProductOut(ProductCreate):
    id:         int
    active:     bool
    created_at: datetime

    class Config:
        orm_mode = True


class SearchRequest(BaseModel):
    product_id:     Optional[int]       = None
    name:           Optional[str]       = None
    ean:            Optional[str]       = None
    sku:            Optional[str]       = None
    code:           Optional[str]       = None
    map_price:      Optional[float]     = None
    retailers:      List[str]           = ["Mercado Livre", "Amazon BR", "Ri Happy"]
    min_relevance:  float               = 0.8


class BulkSearchRequest(BaseModel):
    product_ids:   List[int]
    retailers:     List[str] = ["Mercado Livre", "Amazon BR", "Ri Happy"]
    min_relevance: float     = 0.8


class RunOut(BaseModel):
    run_id: int
    status: str

    class Config:
        orm_mode = True


class ResultOut(BaseModel):
    id:          int
    retailer:    str
    name_found:  str
    price:       Optional[float] = None
    seller:      Optional[str]   = None
    url:         Optional[str]   = None
    relevance:   float
    captured_at: Optional[str]   = None

    class Config:
        orm_mode = True


class ReportSettingCreate(BaseModel):
    recipient_email: EmailStr
    send_weekly:     bool = True
    weekday:         int  = 1


class ReportLogOut(BaseModel):
    id:         int
    message:    str
    created_at: datetime

    class Config:
        orm_mode = True
