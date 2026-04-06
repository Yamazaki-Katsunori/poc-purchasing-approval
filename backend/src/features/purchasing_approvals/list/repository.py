from sqlalchemy import select
from sqlalchemy.orm import Session
from wireup import injectable

from src.features.purchasing_approvals.list.interfaces import IApprovalListRepository
from src.models.purchasing_approval import PurchasingApproval


@injectable(lifetime="scoped", as_type=IApprovalListRepository)
class ApprovalListRepository(IApprovalListRepository):
    """申請リストリポジトリ"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_approval_list(self) -> list[PurchasingApproval]:
        stmt = select(PurchasingApproval).order_by(PurchasingApproval.created_at.desc())
        return list(self.db.scalars(stmt).all())
