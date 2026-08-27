from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


# =========================================================
# CALCULATE SALE PRICE
# =========================================================

def calculate_sale_price(
    retail_price: Decimal,
    discount: Decimal
) -> Decimal:

    discount_amount = (
        retail_price * discount / Decimal("100")
    )

    sale_price = retail_price - discount_amount

    return sale_price.quantize(Decimal("0.01"))


# =========================================================
# CREATE PRODUCT
# =========================================================

def create_product(
    db: Session,
    product_data: ProductCreate
) -> Product:

    sale_price = calculate_sale_price(
        product_data.retail_price,
        product_data.discount
    )

    product = Product(
        name=product_data.name,
        category=product_data.category,
        description=product_data.description,
        quantity=product_data.quantity,
        purchase_price=product_data.purchase_price,
        retail_price=product_data.retail_price,
        discount=product_data.discount,
        sale_price=sale_price,
        supplier_id=product_data.supplier_id,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# =========================================================
# GET ALL PRODUCTS
# =========================================================

def get_products(
    db: Session
) -> list[Product]:

    return (
        db.query(Product)
        .order_by(Product.id)
        .all()
    )


# =========================================================
# GET ONE PRODUCT
# =========================================================

def get_product(
    db: Session,
    product_id: int
) -> Product | None:

    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


# =========================================================
# UPDATE PRODUCT
# =========================================================

def update_product(
    db: Session,
    product: Product,
    product_data: ProductUpdate
) -> Product:

    update_data = product_data.model_dump(
        exclude_unset=True
    )

    # -----------------------------------------
    # Update normal fields
    # -----------------------------------------

    for field, value in update_data.items():

        setattr(
            product,
            field,
            value
        )

    # -----------------------------------------
    # Recalculate sale price
    # -----------------------------------------

    retail_price = product.retail_price
    discount = product.discount

    product.sale_price = calculate_sale_price(
        retail_price,
        discount
    )

    db.commit()
    db.refresh(product)

    return product


# =========================================================
# DELETE PRODUCT
# =========================================================

def delete_product(
    db: Session,
    product: Product
) -> None:

    db.delete(product)
    db.commit()