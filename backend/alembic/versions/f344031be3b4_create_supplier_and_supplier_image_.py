"""create supplier and supplier image tables

Revision ID: f344031be3b4
Revises: 1983f57d63fe
Create Date: 2026-...
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f344031be3b4"
down_revision: Union[str, Sequence[str], None] = "1983f57d63fe"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Suppliers
    op.create_table(
        "suppliers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_suppliers_id",
        "suppliers",
        ["id"],
        unique=False,
    )

    # Supplier images
    op.create_table(
        "supplier_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("supplier_id", sa.Integer(), nullable=False),
        sa.Column("data", sa.LargeBinary(), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["supplier_id"],
            ["suppliers.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("supplier_id"),
    )

    op.create_index(
        "ix_supplier_images_id",
        "supplier_images",
        ["id"],
        unique=False,
    )

    # Connect products to suppliers
    op.add_column(
        "products",
        sa.Column("supplier_id", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "fk_products_supplier_id",
        "products",
        "suppliers",
        ["supplier_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_products_supplier_id",
        "products",
        type_="foreignkey",
    )

    op.drop_column("products", "supplier_id")

    op.drop_index(
        "ix_supplier_images_id",
        table_name="supplier_images",
    )
    op.drop_table("supplier_images")

    op.drop_index(
        "ix_suppliers_id",
        table_name="suppliers",
    )
    op.drop_table("suppliers")