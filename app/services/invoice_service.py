from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.product import Product
from app.schemas.invoice import InvoiceCreate


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
            total_amount=total_amount
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