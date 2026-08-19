from pydantic import BaseModel, Field


class StockUpdate(BaseModel):

    quantity: int = Field(
        gt=0,
        description="Quantity must be greater than zero"
    )


class InventoryResponse(BaseModel):

    product_id: int
    product_name: str
    quantity: int
    purchase_price: float
    sale_price: float
    stock_value: float