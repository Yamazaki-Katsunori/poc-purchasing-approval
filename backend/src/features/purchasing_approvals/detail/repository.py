from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from wireup import injectable

from src.features.purchasing_approvals.detail.interfaces import (
    IApprovalDetailEventRepository,
    IApprovalDetailRepository,
    IApprovalDetailStatusRepository,
)
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.models.user import User


@injectable(lifetime="scoped", as_type=IApprovalDetailRepository)
class ApprovalDetailRepository(IApprovalDetailRepository):
    """購買申請詳細リポジトリ"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, approval_id: int) -> PurchasingApproval | None:
        """リクエストのidを元に申請データを1件取得する"""
        stmt = (
            select(PurchasingApproval)
            .where(PurchasingApproval.id == approval_id)
            .options(
                joinedload(PurchasingApproval.user).selectinload(User.roles),
                joinedload(PurchasingApproval.current_status),
                joinedload(PurchasingApproval.current_event).options(
                    joinedload(PurchasingApprovalEvent.performer).selectinload(User.roles)
                ),
            )
        )

        return self.db.execute(stmt).scalar_one_or_none()

    def save(self, approval: PurchasingApproval) -> PurchasingApproval:
        """リクエストのidを元に申請データを更新する"""
        self.db.add(approval)
        self.db.flush()
        return approval

    def update_current_event_id(
        self,
        approval: PurchasingApproval,
        approval_event_id: int,
    ) -> PurchasingApproval:
        approval.current_event_id = approval_event_id
        self.db.flush()
        return approval


@injectable(lifetime="scoped", as_type=IApprovalDetailEventRepository)
class ApprovalDetailEventRepository(IApprovalDetailEventRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, approval_event: PurchasingApprovalEvent) -> PurchasingApprovalEvent:
        self.db.add(approval_event)
        self.db.flush()
        return approval_event


@injectable(lifetime="scoped", as_type=IApprovalDetailStatusRepository)
class ApprovalDetailStatusRepository(IApprovalDetailStatusRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_code(self, code: str) -> PurchasingApprovalStatus | None:
        return self.db.scalar(select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == code))
