from decimal import Decimal

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)

from fastapi.responses import Response

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)

from app.services import (
    product_service,
    supplier_service,
    product_image_service,
)
from app.core.dependencies import require_admin
from app.models.user import User


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================================================
# CREATE PRODUCT
# =========================================================

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_product(

    name: str = Form(...),

    category: str | None = Form(None),

    description: str | None = Form(None),

    quantity: int = Form(0),

    purchase_price: Decimal = Form(...),

    retail_price: Decimal = Form(...),

    discount: Decimal = Form(0),

    sale_price: Decimal = Form(...),

    supplier_id: int | None = Form(None),

    image: UploadFile | None = File(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(require_admin),
):

    # =====================================================
    # VALIDATE SUPPLIER
    # =====================================================

    if supplier_id is not None:

        supplier = supplier_service.get_supplier(
            db,
            supplier_id
        )

        if not supplier:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier not found"
            )

    # =====================================================
    # VALIDATE PRODUCT DATA
    # =====================================================

    if quantity < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )

    if purchase_price < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase price cannot be negative"
        )

    if retail_price < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Retail price cannot be negative"
        )

    if discount < 0 or discount > 100:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discount must be between 0 and 100"
        )

    if sale_price < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale price cannot be negative"
        )

    # =====================================================
    # CREATE PRODUCT SCHEMA
    # =====================================================

    product_data = ProductCreate(
        name=name,
        category=category,
        description=description,
        quantity=quantity,
        purchase_price=purchase_price,
        retail_price=retail_price,
        discount=discount,
        sale_price=sale_price,
        supplier_id=supplier_id,
    )

    # =====================================================
    # CREATE PRODUCT
    # =====================================================

    product = product_service.create_product(
        db,
        product_data
    )

    # =====================================================
    # STORE PRODUCT IMAGE
    # =====================================================

    if image:

        # -------------------------------------------------
        # Validate MIME type
        # -------------------------------------------------

        if image.content_type not in (
            "image/jpeg",
            "image/png",
            "image/webp",
        ):

            product_service.delete_product(
                db,
                product
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Only JPEG, PNG and WebP "
                    "images are allowed"
                )
            )

        # -------------------------------------------------
        # Read uploaded image
        # -------------------------------------------------

        image_data = await image.read()

        try:

            # -------------------------------------------------
            # Backend automatically:
            #
            # 1. Stores original image
            # 2. Generates thumbnail
            # 3. Stores thumbnail
            #
            # -------------------------------------------------

            product_image_service.save_product_image(
                db=db,
                product_id=product.id,
                image_data=image_data,
                mime_type=image.content_type,
            )

        except ValueError as e:

            # -------------------------------------------------
            # Remove product if image processing fails
            # -------------------------------------------------

            product_service.delete_product(
                db,
                product
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    # =====================================================
    # GET THUMBNAIL URL
    # =====================================================

    thumbnail_url = (
        product_image_service.get_thumbnail_url(
            db,
            product.id
        )
    )

    # =====================================================
    # RETURN PRODUCT
    # =====================================================

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "quantity": product.quantity,
        "purchase_price": product.purchase_price,
        "retail_price": product.retail_price,
        "discount": product.discount,
        "sale_price": product.sale_price,
        "supplier_id": product.supplier_id,
        "thumbnail_url": thumbnail_url,
    }


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@router.get(
    "",
    response_model=list[ProductResponse]
)
def get_products(
    db: Session = Depends(get_db),
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

        response.append(
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "category": product.category,
                "quantity": product.quantity,
                "purchase_price": product.purchase_price,
                "retail_price": product.retail_price,
                "discount": product.discount,
                "sale_price": product.sale_price,
                "supplier_id": product.supplier_id,
                "thumbnail_url": thumbnail_url,
            }
        )

    return response


# =========================================================
# GET ONE PRODUCT
# =========================================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
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
        "category": product.category,
        "quantity": product.quantity,
        "purchase_price": product.purchase_price,
        "retail_price": product.retail_price,
        "discount": product.discount,
        "sale_price": product.sale_price,
        "supplier_id": product.supplier_id,
        "thumbnail_url": thumbnail_url,
    }


# =========================================================
# UPDATE PRODUCT
# =========================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
async def update_product(

    product_id: int,

    name: str | None = Form(None),

    category: str | None = Form(None),

    description: str | None = Form(None),

    quantity: int | None = Form(None),

    purchase_price: Decimal | None = Form(None),

    retail_price: Decimal | None = Form(None),

    discount: Decimal | None = Form(None),

    sale_price: Decimal | None = Form(None),

    supplier_id: int | None = Form(None),

    image: UploadFile | None = File(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(require_admin),
):

    # =====================================================
    # GET EXISTING PRODUCT
    # =====================================================

    product = product_service.get_product(
        db,
        product_id
    )

    if not product:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # =====================================================
    # VALIDATE SUPPLIER
    # =====================================================

    if supplier_id is not None:

        supplier = supplier_service.get_supplier(
            db,
            supplier_id
        )

        if not supplier:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier not found"
            )

    # =====================================================
    # VALIDATE PRODUCT FIELDS
    # =====================================================

    if quantity is not None and quantity < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )

    if purchase_price is not None and purchase_price < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase price cannot be negative"
        )

    if retail_price is not None and retail_price < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Retail price cannot be negative"
        )

    if (
        discount is not None
        and (discount < 0 or discount > 100)
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discount must be between 0 and 100"
        )

    if sale_price is not None and sale_price < 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale price cannot be negative"
        )

    # =====================================================
    # CREATE UPDATE SCHEMA
    # =====================================================

    product_data = ProductUpdate(
        name=name,
        category=category,
        description=description,
        quantity=quantity,
        purchase_price=purchase_price,
        retail_price=retail_price,
        discount=discount,
        sale_price=sale_price,
        supplier_id=supplier_id,
    )

    # =====================================================
    # UPDATE PRODUCT
    # =====================================================

    product = product_service.update_product(
        db,
        product,
        product_data
    )

    # =====================================================
    # REPLACE PRODUCT IMAGE
    # =====================================================

    if image:

        # -------------------------------------------------
        # Validate MIME type
        # -------------------------------------------------

        if image.content_type not in (
            "image/jpeg",
            "image/png",
            "image/webp",
        ):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Only JPEG, PNG and WebP "
                    "images are allowed"
                )
            )

        # -------------------------------------------------
        # Read uploaded image
        # -------------------------------------------------

        image_data = await image.read()

        try:

            # -------------------------------------------------
            # Backend automatically:
            #
            # 1. Replaces original image
            # 2. Generates new thumbnail
            # 3. Replaces old thumbnail
            #
            # -------------------------------------------------

            product_image_service.save_product_image(
                db=db,
                product_id=product.id,
                image_data=image_data,
                mime_type=image.content_type,
            )

        except ValueError as e:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    # =====================================================
    # GET UPDATED THUMBNAIL URL
    # =====================================================

    thumbnail_url = (
        product_image_service.get_thumbnail_url(
            db,
            product.id
        )
    )

    # =====================================================
    # RETURN UPDATED PRODUCT
    # =====================================================

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "quantity": product.quantity,
        "purchase_price": product.purchase_price,
        "retail_price": product.retail_price,
        "discount": product.discount,
        "sale_price": product.sale_price,
        "supplier_id": product.supplier_id,
        "thumbnail_url": thumbnail_url,
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
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


# =========================================================
# UPLOAD / REPLACE PRODUCT IMAGE
# =========================================================

@router.post(
    "/{product_id}/images",
    status_code=status.HTTP_201_CREATED
)
async def upload_product_image(

    product_id: int,

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(require_admin),
):

    # =====================================================
    # CHECK PRODUCT
    # =====================================================

    product = product_service.get_product(
        db,
        product_id
    )

    if not product:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # =====================================================
    # VALIDATE MIME TYPE
    # =====================================================

    if file.content_type not in (
        "image/jpeg",
        "image/png",
        "image/webp",
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only JPEG, PNG and WebP "
                "images are allowed"
            )
        )

    # =====================================================
    # READ IMAGE
    # =====================================================

    image_data = await file.read()

    # =====================================================
    # SAVE ORIGINAL + GENERATE THUMBNAIL
    # =====================================================

    try:

        full_image, thumbnail_image = (
            product_image_service.save_product_image(
                db=db,
                product_id=product_id,
                image_data=image_data,
                mime_type=file.content_type,
            )
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # =====================================================
    # RETURN IMAGE INFORMATION
    # =====================================================

    return {
        "message": "Product image uploaded successfully",

        "product_id": product_id,

        "full_image_url": (
            f"/products/{product_id}/images/"
            f"{full_image.id}"
        ),

        "thumbnail_url": (
            f"/products/{product_id}/images/"
            f"{thumbnail_image.id}"
        ),

        "full_image_id": full_image.id,

        "thumbnail_image_id": thumbnail_image.id,

        "full_image_size": full_image.file_size,

        "thumbnail_image_size": (
            thumbnail_image.file_size
        ),

        "mime_type": full_image.mime_type,
    }


# =========================================================
# GET PRODUCT IMAGE
# =========================================================

@router.get(
    "/{product_id}/images/{image_id}"
)
def get_product_image(

    product_id: int,

    image_id: int,

    db: Session = Depends(get_db),
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