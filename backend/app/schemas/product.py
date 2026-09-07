from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


# =========================================================
# CREATE PRODUCT
# =========================================================

class ProductCreate(BaseModel):

    name: str = Field(
        min_length=1,
        max_length=150
    )

    category: str | None = Field(
        default=None,
        max_length=100
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    quantity: int = Field(
        default=0,
        ge=0
    )

    purchase_price: Decimal = Field(
        ge=0
    )

    retail_price: Decimal = Field(
        ge=0
    )

    discount: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=100
    )

    sale_price: Decimal = Field(
        ge=0
    )

    supplier_id: int | None = None


# =========================================================
# UPDATE PRODUCT
# =========================================================

class ProductUpdate(BaseModel):

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    category: str | None = Field(
        default=None,
        max_length=100
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    quantity: int | None = Field(
        default=None,
        ge=0
    )

    purchase_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    retail_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    discount: Decimal | None = Field(
        default=None,
        ge=0,
        le=100
    )

    sale_price: Decimal | None = Field(
        default=None,
        ge=0
    )

    supplier_id: int | None = None


# =========================================================
# PRODUCT RESPONSE
# =========================================================

class ProductResponse(BaseModel):

    id: int
    name: str
    category: str | None = None
    description: str | None = None

    quantity: int

    purchase_price: Decimal
    retail_price: Decimal
    discount: Decimal
    sale_price: Decimal

    supplier_id: int | None = None

    thumbnail_url: str | None = None

    model_config = ConfigDict(
        from_attributes = True
    )