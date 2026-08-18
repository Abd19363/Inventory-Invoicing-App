from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


# ==========================================
# INVOICE ITEM REQUEST
# ==========================================

class InvoiceItemCreate(BaseModel):

    product_id: int

    quantity: int = Field(
        gt=0
    )


# ==========================================
# CREATE INVOICE REQUEST
# ==========================================

class InvoiceCreate(BaseModel):

    customer_name: str

    customer_email: str | None = None

    items: list[InvoiceItemCreate] = Field(
        min_length=1
    )


# ==========================================
# INVOICE ITEM RESPONSE
# ==========================================

class InvoiceItemResponse(BaseModel):

    id: int

    product_id: int

    quantity: int

    unit_price: Decimal

    subtotal: Decimal

    class Config:
        from_attributes = True


# ==========================================
# INVOICE RESPONSE
# ==========================================

class InvoiceResponse(BaseModel):

    id: int

    customer_name: str

    customer_email: str | None

    total_amount: Decimal

    created_at: datetime

    items: list[InvoiceItemResponse]

    class Config:
        from_attributes = True