from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def create_supplier(
    db: Session,
    supplier_data: SupplierCreate
) -> Supplier:

    supplier = Supplier(
        name=supplier_data.name,
        email=supplier_data.email,
        phone=supplier_data.phone,
        address=supplier_data.address
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def get_suppliers(
    db: Session
) -> list[Supplier]:

    return (
        db.query(Supplier)
        .order_by(Supplier.id)
        .all()
    )


def get_supplier(
    db: Session,
    supplier_id: int
) -> Supplier | None:

    return (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )


def update_supplier(
    db: Session,
    supplier: Supplier,
    supplier_data: SupplierUpdate
) -> Supplier:

    update_data = supplier_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)

    return supplier


def delete_supplier(
    db: Session,
    supplier: Supplier
) -> None:

    db.delete(supplier)
    db.commit()