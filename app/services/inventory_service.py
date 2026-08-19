from sqlalchemy.orm import Session

from app.models.product import Product


def get_inventory(
    db: Session
) -> list[Product]:

    return (
        db.query(Product)
        .order_by(Product.id)
        .all()
    )


def get_product_inventory(
    db: Session,
    product_id: int
) -> Product | None:

    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def add_stock(
    db: Session,
    product: Product,
    quantity: int
) -> Product:

    product.quantity += quantity

    db.commit()
    db.refresh(product)

    return product


def remove_stock(
    db: Session,
    product: Product,
    quantity: int
) -> Product:

    if product.quantity < quantity:
        raise ValueError("Insufficient stock")

    product.quantity -= quantity

    db.commit()
    db.refresh(product)

    return product


def get_low_stock_products(
    db: Session,
    threshold: int
) -> list[Product]:

    return (
        db.query(Product)
        .filter(Product.quantity > 0)
        .filter(Product.quantity <= threshold)
        .order_by(Product.quantity)
        .all()
    )


def get_out_of_stock_products(
    db: Session
) -> list[Product]:

    return (
        db.query(Product)
        .filter(Product.quantity == 0)
        .order_by(Product.id)
        .all()
    )