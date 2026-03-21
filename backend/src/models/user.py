from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.draft_purchasing_approval import DraftPurchasingApproval
    from src.models.purchasing_approval import PurchasingApproval
    from src.models.role import Role
    from src.models.user_position import UserPosition


class User(Base):
    """usersテーブルのモデルクラス"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="氏名")
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, comment="メールアドレス")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, comment="パスワードハッシュ")
    position_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("user_positions.id", ondelete="SET NULL"),
        nullable=True,
        comment="役職ID",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("TRUE"),
        comment="有効フラグ",
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))

    roles: Mapped[list[Role]] = relationship("Role", secondary="user_roles", back_populates="users", lazy="selectin")
    position: Mapped[UserPosition | None] = relationship(back_populates="users", lazy="joined")
    approvals: Mapped[list[PurchasingApproval]] = relationship(back_populates="user", lazy="selectin")
    draft_approvals: Mapped[list[DraftPurchasingApproval]] = relationship(back_populates="user", lazy="selectin")
