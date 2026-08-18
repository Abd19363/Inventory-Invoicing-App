from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Supplier(Base):

    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    address: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    profile_image = relationship(
        "SupplierImage",
        back_populates="supplier",
        uselist=False,
        cascade="all, delete-orphan"
    )
