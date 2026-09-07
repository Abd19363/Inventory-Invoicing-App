from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.models.supplier_image import SupplierImage


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def save_supplier_image(
    db: Session,
    supplier: Supplier,
    image_data: bytes,
    mime_type: str
) -> SupplierImage:

    file_size = len(image_data)

    # Check file type
    if mime_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(
            "Only JPEG, PNG and WebP images are allowed"
        )

    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise ValueError(
            "Image size must not exceed 5 MB"
        )

    # Check whether supplier already has an image
    existing_image = (
        db.query(SupplierImage)
        .filter(
            SupplierImage.supplier_id == supplier.id
        )
        .first()
    )

    if existing_image:

        existing_image.data = image_data
        existing_image.mime_type = mime_type
        existing_image.file_size = file_size

        db.commit()
        db.refresh(existing_image)

        return existing_image

    # Create new image
    supplier_image = SupplierImage(
        supplier_id=supplier.id,
        data=image_data,
        mime_type=mime_type,
        file_size=file_size
    )

    db.add(supplier_image)
    db.commit()
    db.refresh(supplier_image)

    return supplier_image

def get_supplier_image(
    db: Session,
    supplier_id: int
) -> SupplierImage | None:

    return (
        db.query(SupplierImage)
        .filter(
            SupplierImage.supplier_id == supplier_id
        )
        .first()
    )