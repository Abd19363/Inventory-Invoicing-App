from io import BytesIO

from PIL import Image
from sqlalchemy.orm import Session

from app.models.product_image import ProductImage


# =========================================================
# IMAGE CONFIGURATION
# =========================================================

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

THUMBNAIL_SIZE = (300, 300)


# =========================================================
# VALIDATE IMAGE
# =========================================================

def validate_image(
    image_data: bytes,
    mime_type: str,
) -> None:

    # -----------------------------------------------------
    # Validate MIME type
    # -----------------------------------------------------

    if mime_type not in ALLOWED_IMAGE_TYPES:

        raise ValueError(
            "Only JPEG, PNG and WebP images are allowed"
        )

    # -----------------------------------------------------
    # Validate empty file
    # -----------------------------------------------------

    if not image_data:

        raise ValueError(
            "Image file cannot be empty"
        )

    # -----------------------------------------------------
    # Validate file size
    # -----------------------------------------------------

    if len(image_data) > MAX_FILE_SIZE:

        raise ValueError(
            "Image size must not exceed 5 MB"
        )

    # -----------------------------------------------------
    # Validate actual image content
    # -----------------------------------------------------

    try:

        image = Image.open(
            BytesIO(image_data)
        )

        image.verify()

    except Exception:

        raise ValueError(
            "Uploaded file is not a valid image"
        )


# =========================================================
# CREATE THUMBNAIL
# =========================================================

def create_thumbnail(
    image_data: bytes,
) -> tuple[bytes, str]:

    try:

        image = Image.open(
            BytesIO(image_data)
        )

        # -------------------------------------------------
        # Convert image to RGB
        # -------------------------------------------------

        if image.mode != "RGB":

            image = image.convert("RGB")

        # -------------------------------------------------
        # Resize while maintaining aspect ratio
        # -------------------------------------------------

        image.thumbnail(
            THUMBNAIL_SIZE,
            Image.Resampling.LANCZOS
        )

        # -------------------------------------------------
        # Store generated thumbnail in memory
        # -------------------------------------------------

        thumbnail_buffer = BytesIO()

        # -------------------------------------------------
        # Always store generated thumbnail as JPEG
        # -------------------------------------------------

        image.save(
            thumbnail_buffer,
            format="JPEG",
            quality=85,
            optimize=True
        )

        thumbnail_data = (
            thumbnail_buffer.getvalue()
        )

        return thumbnail_data, "image/jpeg"

    except Exception:

        raise ValueError(
            "Unable to generate product thumbnail"
        )


# =========================================================
# SAVE PRODUCT IMAGE
# =========================================================
#
# One uploaded image produces TWO database records:
#
# 1. Full/original image
# 2. Automatically generated thumbnail
#
# =========================================================

def save_product_image(
    db: Session,
    product_id: int,
    image_data: bytes,
    mime_type: str,
) -> tuple[ProductImage, ProductImage]:

    # -----------------------------------------------------
    # Validate original image
    # -----------------------------------------------------

    validate_image(
        image_data,
        mime_type
    )

    # -----------------------------------------------------
    # Generate thumbnail automatically
    # -----------------------------------------------------

    thumbnail_data, thumbnail_mime_type = (
        create_thumbnail(
            image_data
        )
    )

    # -----------------------------------------------------
    # Check existing full image
    # -----------------------------------------------------

    existing_full = (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id,
            ProductImage.image_type == "full",
        )
        .first()
    )

    # -----------------------------------------------------
    # Check existing thumbnail
    # -----------------------------------------------------

    existing_thumbnail = (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id,
            ProductImage.image_type == "thumbnail",
        )
        .first()
    )

    # =====================================================
    # SAVE / UPDATE FULL IMAGE
    # =====================================================

    if existing_full:

        existing_full.data = image_data

        existing_full.mime_type = mime_type

        existing_full.file_size = len(
            image_data
        )

        full_image = existing_full

    else:

        full_image = ProductImage(
            product_id=product_id,
            image_type="full",
            data=image_data,
            mime_type=mime_type,
            file_size=len(image_data),
        )

        db.add(full_image)

    # =====================================================
    # SAVE / UPDATE THUMBNAIL
    # =====================================================

    if existing_thumbnail:

        existing_thumbnail.data = thumbnail_data

        existing_thumbnail.mime_type = (
            thumbnail_mime_type
        )

        existing_thumbnail.file_size = len(
            thumbnail_data
        )

        thumbnail_image = existing_thumbnail

    else:

        thumbnail_image = ProductImage(
            product_id=product_id,
            image_type="thumbnail",
            data=thumbnail_data,
            mime_type=thumbnail_mime_type,
            file_size=len(thumbnail_data),
        )

        db.add(thumbnail_image)

    # -----------------------------------------------------
    # Commit full image and thumbnail together
    # -----------------------------------------------------

    db.commit()

    db.refresh(full_image)

    db.refresh(thumbnail_image)

    return full_image, thumbnail_image


# =========================================================
# GET PRODUCT IMAGE
# =========================================================

def get_product_image(
    db: Session,
    product_id: int,
    image_id: int,
) -> ProductImage | None:

    return (
        db.query(ProductImage)
        .filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id,
        )
        .first()
    )


# =========================================================
# GET THUMBNAIL
# =========================================================

def get_thumbnail(
    db: Session,
    product_id: int,
) -> ProductImage | None:

    return (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id,
            ProductImage.image_type == "thumbnail",
        )
        .first()
    )


# =========================================================
# GET FULL IMAGE
# =========================================================

def get_full_image(
    db: Session,
    product_id: int,
) -> ProductImage | None:

    return (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id,
            ProductImage.image_type == "full",
        )
        .first()
    )


# =========================================================
# GET THUMBNAIL URL
# =========================================================

def get_thumbnail_url(
    db: Session,
    product_id: int,
) -> str | None:

    thumbnail = get_thumbnail(
        db,
        product_id
    )

    if not thumbnail:

        return None

    return (
        f"/products/{product_id}/images/"
        f"{thumbnail.id}"
    )


# =========================================================
# GET FULL IMAGE URL
# =========================================================

def get_full_image_url(
    db: Session,
    product_id: int,
) -> str | None:

    full_image = get_full_image(
        db,
        product_id
    )

    if not full_image:

        return None

    return (
        f"/products/{product_id}/images/"
        f"{full_image.id}"
    )