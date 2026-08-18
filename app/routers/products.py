from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.responses import Response

from app.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)
from app.services import product_service, supplier_service, product_image_service
from app.models.product_image import ProductImage



router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ==========================================
# CREATE PRODUCT
# ==========================================

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):

    # Validate supplier if one was provided
    if product_data.supplier_id is not None:

        supplier = supplier_service.get_supplier(
            db,
            product_data.supplier_id
        )

        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier not found"
            )

    # Validate quantity
    if product_data.quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )

    # Validate prices
    if product_data.purchase_price < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase price cannot be negative"
        )

    if product_data.sale_price < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale price cannot be negative"
        )

    return product_service.create_product(
        db,
        product_data
    )


# ==========================================
# GET ALL PRODUCTS
# ==========================================

@router.get(
    "",
    response_model=list[ProductResponse]
)
def get_products(
    db: Session = Depends(get_db)
):

    products = product_service.get_products(db)

    response = []

    for product in products:

        thumbnail_url = (
            product_image_service.get_thumbnail_url(
                db,
                product.id
            )
        )

        response.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "quantity": product.quantity,
            "purchase_price": product.purchase_price,
            "sale_price": product.sale_price,
            "supplier_id": product.supplier_id,
            "thumbnail_url": thumbnail_url
        })

    return response


# ==========================================
# GET ONE PRODUCT
# ==========================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = product_service.get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    thumbnail_url = (
        product_image_service.get_thumbnail_url(
            db,
            product.id
        )
    )

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "quantity": product.quantity,
        "purchase_price": product.purchase_price,
        "sale_price": product.sale_price,
        "supplier_id": product.supplier_id,
        "thumbnail_url": thumbnail_url
    }

def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = product_service.get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product


# ==========================================
# UPDATE PRODUCT
# ==========================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):

    product = product_service.get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Validate supplier
    if (
        product_data.supplier_id is not None
    ):

        supplier = supplier_service.get_supplier(
            db,
            product_data.supplier_id
        )

        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier not found"
            )

    # Validate quantity
    if (
        product_data.quantity is not None
        and product_data.quantity < 0
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )

    # Validate purchase price
    if (
        product_data.purchase_price is not None
        and product_data.purchase_price < 0
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase price cannot be negative"
        )

    # Validate sale price
    if (
        product_data.sale_price is not None
        and product_data.sale_price < 0
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale price cannot be negative"
        )

    return product_service.update_product(
        db,
        product,
        product_data
    )


# ==========================================
# DELETE PRODUCT
# ==========================================

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = product_service.get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product_service.delete_product(
        db,
        product
    )

    return None


# ==========================================
# Upload PRODUCT Image
# ==========================================

@router.post(
    "/{product_id}/images",
    status_code=status.HTTP_201_CREATED
)
def upload_product_image(
    product_id: int,
    image_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Check product exists
    product = product_service.get_product(
        db,
        product_id
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Read image
    image_data = file.file.read()

    try:

        product_image = (
            product_image_service.save_product_image(
                db=db,
                product_id=product_id,
                image_data=image_data,
                mime_type=file.content_type,
                image_type=image_type
            )
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return {
        "message": "Product image uploaded successfully",
        "image_id": product_image.id,
        "product_id": product_id,
        "image_type": product_image.image_type,
        "mime_type": product_image.mime_type,
        "file_size": product_image.file_size
    }

# ==========================================
# Get PRODUCT Image
# ==========================================

@router.get(
    "/{product_id}/images/{image_id}"
)
def get_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):

    image = product_image_service.get_product_image(
        db,
        product_id,
        image_id
    )

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found"
        )

    return Response(
        content=image.data,
        media_type=image.mime_type
    )