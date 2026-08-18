from datetime import datetime

from sqlalchemy import ForeignKey, String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class RefreshToken(Base):

    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    token: Mapped[str] = mapped_column(
        String(500),
        unique=True,
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    revoked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="refresh_tokens"
    )