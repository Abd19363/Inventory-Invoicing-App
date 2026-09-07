from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InvoiceItem(Base):

    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    unit_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    subtotal: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    invoice = relationship(
        "Invoice",
        back_populates="items"
    )

    product = relationship(
        "Product"
    )