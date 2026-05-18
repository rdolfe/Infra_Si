"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-05-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "agencies",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("address", sa.String(500), nullable=False),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("visitor", "client", "agent", "admin", name="userrole"),
            nullable=False,
        ),
        sa.Column("agency_id", sa.String(36), sa.ForeignKey("agencies.id"), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "properties",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("surface", sa.Float, nullable=False),
        sa.Column("rooms", sa.Integer, nullable=False),
        sa.Column(
            "type",
            sa.Enum(
                "apartment", "house", "villa", "studio", "office", "retail", "warehouse",
                name="propertytype",
            ),
            nullable=False,
        ),
        sa.Column(
            "category",
            sa.Enum("residential", "professional", name="propertycategory"),
            nullable=False,
        ),
        sa.Column("address", sa.String(500), nullable=False),
        sa.Column("lat", sa.Float, nullable=True),
        sa.Column("lng", sa.Float, nullable=True),
        sa.Column("dpe_rating", sa.String(1), nullable=True),
        sa.Column("coup_de_coeur", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column(
            "status",
            sa.Enum("draft", "published", "sold", name="propertystatus"),
            nullable=False,
        ),
        sa.Column("floor", sa.Integer, nullable=True),
        sa.Column("parking", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("cellar", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("garden", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("agent_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("agency_id", sa.String(36), sa.ForeignKey("agencies.id"), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "photos",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("property_id", sa.String(36), sa.ForeignKey("properties.id"), nullable=False),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("display_order", sa.Integer, nullable=False, server_default=sa.text("0")),
    )

    op.create_table(
        "favorites",
        sa.Column("client_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("property_id", sa.String(36), sa.ForeignKey("properties.id"), nullable=False),
        sa.PrimaryKeyConstraint("client_id", "property_id", name="pk_favorites"),
    )

    op.create_table(
        "offers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("property_id", sa.String(36), sa.ForeignKey("properties.id"), nullable=False),
        sa.Column("client_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("agent_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("proposed_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("counter_price", sa.Numeric(12, 2), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "countered", "accepted", "rejected", name="offerstatus"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("property_id", sa.String(36), sa.ForeignKey("properties.id"), nullable=False),
        sa.Column("offer_id", sa.String(36), sa.ForeignKey("offers.id"), nullable=False),
        sa.Column("client_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("agent_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("in_progress", "completed", name="transactionstatus"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.UniqueConstraint("offer_id", name="uq_transactions_offer_id"),
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("transaction_id", sa.String(36), sa.ForeignKey("transactions.id"), nullable=False),
        sa.Column("file_url", sa.String(1000), nullable=False),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("signed_at", sa.DateTime, nullable=True),
        sa.Column("signed_by", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("offer_id", sa.String(36), sa.ForeignKey("offers.id"), nullable=True),
        sa.Column("property_id", sa.String(36), sa.ForeignKey("properties.id"), nullable=True),
        sa.Column("sender_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("payload", sa.JSON, nullable=False),
        sa.Column("read", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("messages")
    op.drop_table("documents")
    op.drop_table("transactions")
    op.drop_table("offers")
    op.drop_table("favorites")
    op.drop_table("photos")
    op.drop_table("properties")
    op.drop_table("users")
    op.drop_table("agencies")

    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS propertytype")
    op.execute("DROP TYPE IF EXISTS propertycategory")
    op.execute("DROP TYPE IF EXISTS propertystatus")
    op.execute("DROP TYPE IF EXISTS offerstatus")
    op.execute("DROP TYPE IF EXISTS transactionstatus")
