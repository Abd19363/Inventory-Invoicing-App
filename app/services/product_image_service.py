from sqlalchemy.orm import Session

from app.models.product_image import ProductImage


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def save_product_image(
    db: Session,
    product_id: int,
    image_data: bytes,
    mime_type: str,
    image_type: str
) -> ProductImage:

    # Validate image type
    if image_type not in {"thumbnail", "full"}:
        raise ValueError(
            "image_type must be 'thumbnail' or 'full'"
        )

    # Validate MIME type
    if mime_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(
            "Only JPEG, PNG and WebP images are allowed"
        )

    # Validate file size
    file_size = len(image_data)

    if file_size > MAX_FILE_SIZE:
        raise ValueError(
            "Image size must not exceed 5 MB"
        )

    # ==========================================
    # THUMBNAIL
    # ==========================================

    if image_type == "thumbnail":

        existing_thumbnail = (
            db.query(ProductImage)
            .filter(
                ProductImage.product_id == product_id,
                ProductImage.image_type == "thumbnail"
            )
            .first()
        )

        if existing_thumbnail:

            existing_thumbnail.data = image_data
            existing_thumbnail.mime_type = mime_type
            existing_thumbnail.file_size = file_size

            db.commit()
            db.refresh(existing_thumbnail)

            return existing_thumbnail

    # ==========================================
    # CREATE IMAGE
    # ==========================================

    product_image = ProductImage(
        product_id=product_id,
        image_type=image_type,
        data=image_data,
        mime_type=mime_type,
        file_size=file_size
    )

    db.add(product_image)
    db.commit()
    db.refresh(product_image)

    return product_image

def get_product_image(
    db: Session,
    product_id: int,
    image_id: int
) -> ProductImage | None:

    return (
        db.query(ProductImage)
        .filter(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        )
        .first()
    )


def get_thumbnail(
    db: Session,
    product_id: int
) -> ProductImage | None:

    return (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id,
            ProductImage.image_type == "thumbnail"
        )
        .first()
    )

def get_thumbnail_url(
    db: Session,
    product_id: int
) -> str | None:

    thumbnail = get_thumbnail(
        db,
        product_id
    )

    if not thumbnail:
        return None

    return f"/products/{product_id}/images/{thumbnail.id}"