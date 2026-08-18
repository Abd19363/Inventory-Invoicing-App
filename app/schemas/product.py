from pydantic import BaseModel
from decimal import Decimal


class ProductCreate(BaseModel):

    name: str
    description: str | None = None
    quantity: int = 0
    purchase_price: Decimal
    sale_price: Decimal
    supplier_id: int | None = None


class ProductUpdate(BaseModel):

    name: str | None = None
    description: str | None = None
    quantity: int | None = None
    purchase_price: Decimal | None = None
    sale_price: Decimal | None = None
    supplier_id: int | None = None


class ProductResponse(BaseModel):

    id: int
    name: str
    description: str | None
    quantity: int
    purchase_price: Decimal
    sale_price: Decimal
    supplier_id: int | None
    thumbnail_url: str | None =  None

    class Config:
        from_attributes = True