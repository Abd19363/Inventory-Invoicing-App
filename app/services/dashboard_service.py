from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.invoice import Invoice


def get_dashboard_insights(
    db: Session
) -> dict:

    # ==========================================
    # TOTAL PRODUCTS
    # ==========================================

    total_products = (
        db.query(func.count(Product.id))
        .scalar()
        or 0
    )

    # ==========================================
    # TOTAL STOCK VALUE
    # ==========================================

    total_stock_value = (
        db.query(
            func.coalesce(
                func.sum(
                    Product.quantity
                    * Product.purchase_price
                ),
                0
            )
        )
        .scalar()
    )

    # ==========================================
    # TOTAL REVENUE
    # ==========================================

    total_revenue = (
        db.query(
            func.coalesce(
                func.sum(Invoice.total_amount),
                0
            )
        )
        .scalar()
    )

    # ==========================================
    # TOTAL INVOICES
    # ==========================================

    total_invoices = (
        db.query(func.count(Invoice.id))
        .scalar()
        or 0
    )

    # ==========================================
    # LOW STOCK PRODUCTS
    # ==========================================

    low_stock_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.quantity > 0,
            Product.quantity <= 10
        )
        .scalar()
        or 0
    )

    # ==========================================
    # OUT OF STOCK PRODUCTS
    # ==========================================

    out_of_stock_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.quantity == 0
        )
        .scalar()
        or 0
    )

    return {
        "total_products": total_products,
        "total_stock_value": Decimal(
            str(total_stock_value)
        ),
        "total_revenue": Decimal(
            str(total_revenue)
        ),
        "total_invoices": total_invoices,
        "low_stock_products": low_stock_products,
        "out_of_stock_products": out_of_stock_products
    }