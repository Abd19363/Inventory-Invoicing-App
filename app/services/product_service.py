from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(
    db: Session,
    product_data: ProductCreate
) -> Product:

    product = Product(
        name=product_data.name,
        description=product_data.description,
        quantity=product_data.quantity,
        purchase_price=product_data.purchase_price,
        sale_price=product_data.sale_price,
        supplier_id=product_data.supplier_id
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_products(
    db: Session
) -> list[Product]:

    return (
        db.query(Product)
        .order_by(Product.id)
        .all()
    )


def get_product(
    db: Session,
    product_id: int
) -> Product | None:

    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def update_product(
    db: Session,
    product: Product,
    product_data: ProductUpdate
) -> Product:

    update_data = product_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product: Product
) -> None:

    db.delete(product)
    db.commit()