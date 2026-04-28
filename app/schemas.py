from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    ean: Optional[str] = None
    sku: Optional[str] = None
    code: Optional[str] = None
    map_price: Optional[float] = None

class ProductOut(ProductCreate):
    id: int
    active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class SearchRequest(BaseModel):
    product_id: Optional[int] = None   # busca vinculada a produto cadastrado
    name: Optional[str] = None         # ou busca avulsa
    ean: Optional[str] = None
    sku: Optional[str] = None
    code: Optional[str] = None
    map_price: Optional[float] = None
    retailers: list[str] = ["Mercado Livre", "Amazon BR", "Ri Happy"]
    min_relevance: float = 0.8

class BulkSearchRequest(BaseModel):
    product_ids: list[int]             # busca todos os cadastrados selecionados
    retailers: list[str] = ["Mercado Livre", "Amazon BR", "Ri Happy"]
    min_relevance: float = 0.8

class RunOut(BaseModel):
    run_id: int
    status: str

class ResultOut(BaseModel):
    id: int
    retailer: str
    name_found: str
    price: Optional[float]
    seller: Optional[str]
    url: Optional[str]
    relevance: float
    captured_at: str
    model_config = {"from_attributes": True}

class ReportSettingCreate(BaseModel):
    recipient_email: EmailStr
    send_weekly: bool = True
    weekday: int = 1