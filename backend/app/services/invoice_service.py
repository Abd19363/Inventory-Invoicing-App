from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.product import Product
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate


def create_invoice(
    db: Session,
    invoice_data: InvoiceCreate
) -> Invoice:

    total_amount = Decimal("0.00")

    invoice_items = []

    try:

        # ==========================================
        # STEP 1 — VALIDATE ALL PRODUCTS + STOCK
        # ==========================================

        for item_data in invoice_data.items:

            product = (
                db.query(Product)
                .filter(
                    Product.id == item_data.product_id
                )
                .first()
            )

            # Product doesn't exist
            if not product:
                raise ValueError(
                    f"Product {item_data.product_id} not found"
                )

            # Insufficient stock
            if product.quantity < item_data.quantity:
                raise ValueError(
                    f"Insufficient stock for product "
                    f"'{product.name}'. "
                    f"Available: {product.quantity}, "
                    f"requested: {item_data.quantity}"
                )

            # ==========================================
            # CALCULATE PRICE
            # ==========================================

            unit_price = Decimal(
                str(product.sale_price)
            )

            subtotal = (
                unit_price
                * item_data.quantity
            )

            total_amount += subtotal

            invoice_items.append({
                "product": product,
                "quantity": item_data.quantity,
                "unit_price": unit_price,
                "subtotal": subtotal
            })

        # ==========================================
        # STEP 2 — CREATE INVOICE
        # ==========================================

        invoice = Invoice(
            customer_name=invoice_data.customer_name,
            customer_email=invoice_data.customer_email,
            total_amount=total_amount,
            status=getattr(invoice_data, "status", "unpaid") or "unpaid"
        )

        db.add(invoice)

        # ==========================================
        # STEP 3 — CREATE ITEMS + DECREASE STOCK
        # ==========================================

        for item in invoice_items:

            product = item["product"]

            invoice_item = InvoiceItem(
                invoice=invoice,
                product_id=product.id,
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                subtotal=item["subtotal"]
            )

            db.add(invoice_item)

            # Decrease stock
            product.quantity -= item["quantity"]

        # ==========================================
        # STEP 4 — COMMIT TRANSACTION
        # ==========================================

        db.commit()

        db.refresh(invoice)

        return invoice

    except ValueError:
        # Business validation error
        # Roll back any pending database changes.
        db.rollback()
        raise

    except Exception:
        # Database/unexpected error
        # Roll back the entire transaction.
        db.rollback()
        raise

def update_invoice(
    db: Session,
    invoice: Invoice,
    invoice_data: InvoiceUpdate | InvoiceCreate
) -> Invoice:

    # Enforce read-only restriction on paid invoices
    if invoice.status == "paid":
        raise PermissionError("Paid invoices are read-only and cannot be modified.")

    try:

        # ==========================================
        # STEP 1 — HANDLE STATUS ONLY UPDATE
        # ==========================================
        if hasattr(invoice_data, "status") and invoice_data.status and not getattr(invoice_data, "items", None):

            invoice.status = invoice_data.status

            if hasattr(invoice_data, "customer_name") and invoice_data.customer_name:
                invoice.customer_name = invoice_data.customer_name

            if hasattr(invoice_data, "customer_email") and invoice_data.customer_email is not None:
                invoice.customer_email = invoice_data.customer_email

            db.commit()

            db.refresh(invoice)

            return invoice

        # ==========================================
        # STEP 2 — RESTORE OLD STOCK FOR ITEM EDIT
        # ==========================================

        for old_item in invoice.items:

            product = (
                db.query(Product)
                .filter(
                    Product.id == old_item.product_id
                )
                .first()
            )

            if product:
                product.quantity += old_item.quantity

        # ==========================================
        # STEP 3 — VALIDATE NEW PRODUCTS + STOCK
        # ==========================================

        total_amount = Decimal("0.00")

        new_items = []

        items_list = getattr(invoice_data, "items", None) or []

        for item_data in items_list:

            product = (
                db.query(Product)
                .filter(
                    Product.id == item_data.product_id
                )
                .first()
            )

            if not product:
                raise ValueError(
                    f"Product {item_data.product_id} not found"
                )

            if product.quantity < item_data.quantity:
                raise ValueError(
                    f"Insufficient stock for product "
                    f"'{product.name}'. "
                    f"Available: {product.quantity}, "
                    f"requested: {item_data.quantity}"
                )

            unit_price = Decimal(
                str(product.sale_price)
            )

            subtotal = (
                unit_price *
                item_data.quantity
            )

            total_amount += subtotal

            new_items.append({
                "product": product,
                "quantity": item_data.quantity,
                "unit_price": unit_price,
                "subtotal": subtotal
            })

        # ==========================================
        # STEP 4 — UPDATE INVOICE INFORMATION
        # ==========================================

        if getattr(invoice_data, "customer_name", None):
            invoice.customer_name = invoice_data.customer_name

        if getattr(invoice_data, "customer_email", None) is not None:
            invoice.customer_email = invoice_data.customer_email

        if getattr(invoice_data, "status", None):
            invoice.status = invoice_data.status

        if items_list:
            invoice.total_amount = total_amount

            # ==========================================
            # STEP 5 — DELETE OLD ITEMS & ADD NEW ONES
            # ==========================================

            for old_item in list(invoice.items):
                db.delete(old_item)

            db.flush()

            for item in new_items:
                product = item["product"]

                invoice_item = InvoiceItem(
                    invoice=invoice,
                    product_id=product.id,
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    subtotal=item["subtotal"]
                )

                db.add(invoice_item)

                product.quantity -= item["quantity"]

        # ==========================================
        # STEP 6 — COMMIT
        # ==========================================

        db.commit()

        db.refresh(invoice)

        return invoice

    except (ValueError, PermissionError):

        db.rollback()
        raise

    except Exception:

        db.rollback()
        raise