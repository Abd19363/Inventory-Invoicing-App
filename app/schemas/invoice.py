from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


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

    status: str = "unpaid"

    items: list[InvoiceItemCreate] = Field(
        min_length=1
    )


# ==========================================
# UPDATE INVOICE REQUEST
# ==========================================

class InvoiceUpdate(BaseModel):

    customer_name: str | None = None

    customer_email: str | None = None

    status: str | None = None

    items: list[InvoiceItemCreate] | None = None


# ==========================================
# INVOICE ITEM RESPONSE
# ==========================================

class InvoiceItemResponse(BaseModel):

    id: int

    product_id: int

    product_name: str

    quantity: int

    unit_price: Decimal

    retail_price: Decimal | None = None

    discount: Decimal | None = None

    sale_price: Decimal | None = None

    subtotal: Decimal

    model_config = ConfigDict(
        from_attributes = True
    )


# ==========================================
# INVOICE RESPONSE
# ==========================================

class InvoiceResponse(BaseModel):

    id: int

    customer_name: str

    customer_email: str | None

    total_amount: Decimal

    status: str

    created_at: datetime

    items: list[InvoiceItemResponse]

    model_config = ConfigDict(
        from_attributes = True
    )

     