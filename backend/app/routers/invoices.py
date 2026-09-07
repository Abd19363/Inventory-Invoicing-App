from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.core.dependencies import require_sales_manager
from app.models.user import User

from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse
)

from app.services.invoice_service import (
    create_invoice,
    update_invoice
)

from app.models.product import Product
from app.models.invoice import Invoice

from app.services.invoice_pdf_service import (
    generate_invoice_pdf
)


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


# ==========================================
# BUILD INVOICE RESPONSE
# ==========================================

def build_invoice_response(
    db: Session,
    invoice: Invoice
):

    items = []

    for item in invoice.items:

        product = (
            db.query(Product)
            .filter(
                Product.id == item.product_id
            )
            .first()
        )

        items.append({

            "id":
                item.id,

            "product_id":
                item.product_id,

            "product_name":
                product.name
                if product
                else "Unknown Product",

            "quantity":
                item.quantity,

            "unit_price":
                item.unit_price,

            "retail_price":
                product.retail_price if product else item.unit_price,

            "discount":
                product.discount if product else 0,

            "sale_price":
                item.unit_price,

            "subtotal":
                item.subtotal

        })


    return {

        "id":
            invoice.id,

        "customer_name":
            invoice.customer_name,

        "customer_email":
            invoice.customer_email,

        "total_amount":
            invoice.total_amount,

        "status":
            getattr(invoice, "status", "unpaid") or "unpaid",

        "created_at":
            invoice.created_at,

        "items":
            items
    }


# ==========================================
# CREATE INVOICE
# ==========================================

@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_manager),
):

    try:

        invoice = create_invoice(
            db,
            invoice_data
        )

        return build_invoice_response(
            db,
            invoice
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================
# GET ALL INVOICES
# ==========================================

@router.get(
    "",
    response_model=list[InvoiceResponse]
)
def get_invoices(
    db: Session = Depends(get_db)
):

    invoices = (
        db.query(Invoice)
        .order_by(
            Invoice.created_at.desc()
        )
        .all()
    )

    return [

        build_invoice_response(
            db,
            invoice
        )

        for invoice in invoices

    ]


# ==========================================
# GET ONE INVOICE
# ==========================================

@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse
)
def get_invoice(
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

    return build_invoice_response(
        db,
        invoice
    )


# ==========================================
# UPDATE INVOICE (PUT)
# ==========================================

@router.put(
    "/{invoice_id}",
    response_model=InvoiceResponse
)
def update_existing_invoice(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
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


    # ==========================================
    # SECURITY CHECK: PAID INVOICES ARE READ-ONLY
    # ==========================================

    if getattr(invoice, "status", "unpaid") == "paid":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Paid invoices are read-only and cannot be modified."
        )


    try:

        updated = update_invoice(
            db,
            invoice,
            invoice_data
        )

        return build_invoice_response(
            db,
            updated
        )

    except PermissionError as e:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================
# DELETE INVOICE
# ==========================================

@router.delete(
    "/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_invoice(
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

    try:

        # ==========================================
        # RESTORE PRODUCT STOCK
        # ==========================================

        for item in invoice.items:

            product = (
                db.query(Product)
                .filter(
                    Product.id == item.product_id
                )
                .first()
            )

            if product:

                product.quantity += (
                    item.quantity
                )


        # ==========================================
        # DELETE INVOICE
        # ==========================================

        db.delete(invoice)

        db.commit()

        return None

    except Exception:

        db.rollback()

        raise


# ==========================================
# GET INVOICE PDF STREAM
# ==========================================

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
            "Content-Disposition": "inline"
        }
    )