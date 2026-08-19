from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services.invoice_service import create_invoice


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db)
):

    try:

        invoice = create_invoice(
            db,
            invoice_data
        )

        return invoice

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )