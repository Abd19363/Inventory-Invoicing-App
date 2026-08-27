from sqlalchemy import String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    purchase_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    retail_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    discount: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0
    )

    sale_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    supplier_id: Mapped[int | None] = mapped_column(
        ForeignKey("suppliers.id"),
        nullable=True
    )

    supplier = relationship(
        "Supplier"
    )

    images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan"
    )