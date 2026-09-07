import enum
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SALES_MANAGER = "SALES_MANAGER"

class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(50),
        default=UserRole.SALES_MANAGER.value,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    refresh_tokens= relationship(
        "RefreshToken",
        back_populates="user"
    )