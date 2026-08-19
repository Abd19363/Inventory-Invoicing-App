from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from app.services.invoice_pdf_service import generate_invoice_pdf
from app.models.invoice import Invoice

from app.database import get_db
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services.invoice_service import create_invoice


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)

#-----------------------------
#      Invoice Post
#-----------------------------

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

#-----------------------------
#      Invoice pdf GET
#-----------------------------


@router.get(
    "/{invoice_id}/pdf"
)
def get_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db)
):

    invoice = (
        db.query(Invoice)
        .filter(
            Invoice.id == invoice_id
        )
        .first()
    )

    if not invoice:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    pdf_buffer = generate_invoice_pdf(
        invoice
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'inline; filename="invoice_{invoice.id}.pdf"'
            )
        }
    )