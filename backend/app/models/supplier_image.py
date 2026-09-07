from sqlalchemy import String, Integer, LargeBinary, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SupplierImage(Base):

    __tablename__ = "supplier_images"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"),
        unique=True,
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

    supplier = relationship(
        "Supplier",
        back_populates="profile_image"
    )