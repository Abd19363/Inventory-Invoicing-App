from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.inventory import (
    StockUpdate,
    InventoryResponse
)
from app.services import inventory_service


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


def inventory_response(product):

    return {
        "product_id": product.id,
        "product_name": product.name,
        "quantity": product.quantity,
        "purchase_price": product.purchase_price,
        "sale_price": product.sale_price,
        "stock_value": product.quantity * product.purchase_price
    }


# ==========================================
# GET ALL INVENTORY
# ==========================================

@router.get(
    "",
    response_model=list[InventoryResponse]
)
def get_inventory(
    db: Session = Depends(get_db)
):

    products = inventory_service.get_inventory(db)

    return [
        inventory_response(product)
        for product in products
    ]


# ==========================================
# GET PRODUCT INVENTORY
# ==========================================

@router.get(
    "/{product_id}",
    response_model=InventoryResponse
)
def get_product_inventory(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = inventory_service.get_product_inventory(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return inventory_response(product)


# ==========================================
# ADD STOCK
# ==========================================

@router.patch(
    "/{product_id}/add",
    response_model=InventoryResponse
)
def add_stock(
    product_id: int,
    stock_data: StockUpdate,
    db: Session = Depends(get_db)
):

    product = inventory_service.get_product_inventory(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product = inventory_service.add_stock(
        db,
        product,
        stock_data.quantity
    )

    return inventory_response(product)


# ==========================================
# REMOVE STOCK
# ==========================================

@router.patch(
    "/{product_id}/remove",
    response_model=InventoryResponse
)
def remove_stock(
    product_id: int,
    stock_data: StockUpdate,
    db: Session = Depends(get_db)
):

    product = inventory_service.get_product_inventory(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    try:

        product = inventory_service.remove_stock(
            db,
            product,
            stock_data.quantity
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return inventory_response(product)


# ==========================================
# LOW STOCK
# ==========================================

@router.get(
    "/status/low-stock",
    response_model=list[InventoryResponse]
)
def get_low_stock(
    threshold: int = Query(
        default=10,
        ge=1
    ),
    db: Session = Depends(get_db)
):

    products = inventory_service.get_low_stock_products(
        db,
        threshold
    )

    return [
        inventory_response(product)
        for product in products
    ]


# ==========================================
# OUT OF STOCK
# ==========================================

@router.get(
    "/status/out-of-stock",
    response_model=list[InventoryResponse]
)
def get_out_of_stock(
    db: Session = Depends(get_db)
):

    products = inventory_service.get_out_of_stock_products(db)

    return [
        inventory_response(product)
        for product in products
    ]