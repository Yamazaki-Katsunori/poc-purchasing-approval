from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from wireup import injectable

from src.features.purchasing_approvals.detail.interfaces import IApprovalDetailRepository
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
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
