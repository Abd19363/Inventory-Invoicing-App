"""create initial tables

Revision ID: ba6c340cee8b
Revises:
Create Date: 2026-...
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ba6c340cee8b"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("email"),
    )

    op.create_index(
        "ix_users_id",
        "users",
        ["id"],
        unique=False,
    )

    # Refresh tokens
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(length=500), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )

    op.create_index(
        "ix_refresh_tokens_id",
        "refresh_tokens",
        ["id"],
        unique=False,
    )

    # Products
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("purchase_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("sale_price", sa.Numeric(12, 2), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_products_id",
        "products",
        ["id"],
        unique=False,
    )

    # Product images
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("image_type", sa.String(length=20), nullable=False),
        sa.Column("data", sa.LargeBinary(), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_product_images_id",
        "product_images",
        ["id"],
        unique=False,
    )

    # Invoices
    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_name", sa.String(), nullable=False),
        sa.Column("customer_email", sa.String(), nullable=True),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column(
            "status",
            sa.String(length=50),
            server_default="unpaid",
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_invoices_id",
        "invoices",
        ["id"],
        unique=False,
    )

    # Invoice items
    op.create_table(
        "invoice_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("invoice_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False),
        sa.ForeignKeyConstraint(
            ["invoice_id"],
            ["invoices.id"],
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_invoice_items_id",
        "invoice_items",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_invoice_items_id", table_name="invoice_items")
    op.drop_table("invoice_items")

    op.drop_index("ix_invoices_id", table_name="invoices")
    op.drop_table("invoices")

    op.drop_index("ix_product_images_id", table_name="product_images")
    op.drop_table("product_images")

    op.drop_index("ix_products_id", table_name="products")
    op.drop_table("products")

    op.drop_index("ix_refresh_tokens_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")