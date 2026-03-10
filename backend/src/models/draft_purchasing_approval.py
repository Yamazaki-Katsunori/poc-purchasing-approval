from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, Numeric, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.purchasing_approval_event import PurchasingApprovalEvent
    from src.models.purchasing_approval_status import PurchasingApprovalStatus
    from src.models.user import User


class DraftPurchasingApproval(Base):
    __tablename__ = "draft_purchasing_approvals"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    purchase_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_status_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("purchasing_approval_statuses.id", ondelete="RESTRICT"), nullable=False
    )
    current_event_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("purchasing_approval_events.id", ondelete="SET NULL"), nullable=True
    )
    last_touched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("NOW()")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))

    user: Mapped[User] = relationship(back_populates="draft_approvals", lazy="joined")
    current_status: Mapped[PurchasingApprovalStatus] = relationship(lazy="joined")
    current_event: Mapped[PurchasingApprovalEvent | None] = relationship(
        foreign_keys=[current_event_id],
        lazy="joined",
        post_update=True,
    )
