from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from fastapi.responses import Response

from app.database import get_db
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse
)
from app.services import supplier_service, supplier_image_service


router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


# ==========================================
# CREATE SUPPLIER
# ==========================================

@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED
)
def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db)
):

    return supplier_service.create_supplier(
        db,
        supplier_data
    )


# ==========================================
# GET ALL SUPPLIERS
# ==========================================

@router.get(
    "",
    response_model=list[SupplierResponse]
)
def get_suppliers(
    db: Session = Depends(get_db)
):

    return supplier_service.get_suppliers(db)


# ==========================================
# GET ONE SUPPLIER
# ==========================================

@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse
)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = supplier_service.get_supplier(
        db,
        supplier_id
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    return supplier


# ==========================================
# UPDATE SUPPLIER
# ==========================================

@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse
)
def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: Session = Depends(get_db)
):

    supplier = supplier_service.get_supplier(
        db,
        supplier_id
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    return supplier_service.update_supplier(
        db,
        supplier,
        supplier_data
    )


# ==========================================
# DELETE SUPPLIER
# ==========================================

@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = supplier_service.get_supplier(
        db,
        supplier_id
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    supplier_service.delete_supplier(
        db,
        supplier
    )

    return None


# ==========================================
# Upload  SUPPLIER Image
# ==========================================

@router.post(
    "/{supplier_id}/image",
    status_code=status.HTTP_201_CREATED
)
def upload_supplier_image(
    supplier_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Find supplier
    supplier = supplier_service.get_supplier(
        db,
        supplier_id
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    # Read uploaded file
    image_data = file.file.read()

    try:

        supplier_image = (
            supplier_image_service.save_supplier_image(
                db,
                supplier,
                image_data,
                file.content_type
            )
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return {
        "message": "Supplier image uploaded successfully",
        "supplier_id": supplier.id,
        "image_id": supplier_image.id,
        "mime_type": supplier_image.mime_type,
        "file_size": supplier_image.file_size
    }


# ==========================================
# Get SUPPLIER Image
# ==========================================

@router.get(
    "/{supplier_id}/image"
)
def get_supplier_image(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    # Check supplier exists
    supplier = supplier_service.get_supplier(
        db,
        supplier_id
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    # Get image
    supplier_image = (
        supplier_image_service.get_supplier_image(
            db,
            supplier_id
        )
    )

    if not supplier_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier image not found"
        )

    return Response(
        content=supplier_image.data,
        media_type=supplier_image.mime_type
    )