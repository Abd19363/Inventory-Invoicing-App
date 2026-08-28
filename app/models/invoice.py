from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Invoice(Base):

    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    customer_name: Mapped[str] = mapped_column(
        nullable=False
    )

    customer_email: Mapped[str | None] = mapped_column(
        nullable=True
    )

    total_amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="unpaid",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    items = relationship(
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )