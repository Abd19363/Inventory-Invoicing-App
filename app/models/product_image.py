from sqlalchemy import String, Integer, LargeBinary, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProductImage(Base):

    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    image_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    data: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    product = relationship(
        "Product",
        back_populates="images"
    )