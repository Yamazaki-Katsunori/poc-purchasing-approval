from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload
from wireup import injectable

from src.features.purchasing_approvals.list.interfaces import IApprovalListRepository
from src.models.purchasing_approval import PurchasingApproval


@injectable(lifetime="scoped", as_type=IApprovalListRepository)
class ApprovalListRepository(IApprovalListRepository):
    """申請リストリポジトリ"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_approval_list(self, offset, limit) -> list[PurchasingApproval]:
        stmt = (
            select(PurchasingApproval)
            .options(joinedload(PurchasingApproval.user), joinedload(PurchasingApproval.current_status))
            .order_by(PurchasingApproval.created_at.desc(), PurchasingApproval.id.desc())
            .offset(offset)
            .limit(limit)
        )
        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def approval_list_count_all(self) -> int:
        stmt = select(func.count()).select_from(PurchasingApproval)
        result = self.db.execute(stmt)
        return result.scalar_one()
