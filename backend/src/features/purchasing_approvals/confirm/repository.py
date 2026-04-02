from sqlalchemy import select
from sqlalchemy.orm import Session
from wireup import injectable

from src.features.purchasing_approvals.confirm.interfaces import (
    IPurchasingApprovalEventRepository,
    IPurchasingApprovalRepository,
    IPurchasingApprovalStatusRepository,
)
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus


@injectable(lifetime="scoped", as_type=IPurchasingApprovalRepository)
class PurchasingApprovalRepository(IPurchasingApprovalRepository):
    """購買新規申請登録処理をまとめたRepository"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_approval(self, approval: PurchasingApproval) -> PurchasingApproval:
        """リクエストされた購買新規申請リクエストを登録する処理"""
        self.db.add(approval)
        self.db.flush()
        return approval

    def update_current_event_id(self, approval: PurchasingApproval, approval_event_id: int) -> PurchasingApproval:
        """登録した購買新規申請データのcurrent_event_idを更新する処理"""
        approval.current_event_id = approval_event_id
        self.db.flush()
        return approval


@injectable(lifetime="scoped", as_type=IPurchasingApprovalEventRepository)
class PurchasingApprovalEventRepository(IPurchasingApprovalEventRepository):
    """購買新規申請登録処理のEvent登録処理をまとめたRepository"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_approval_event(self, approval_event: PurchasingApprovalEvent) -> PurchasingApprovalEvent:
        self.db.add(approval_event)
        self.db.flush()
        return approval_event


@injectable(lifetime="scoped", as_type=IPurchasingApprovalStatusRepository)
class PurchasingApprovalStatusRepository(IPurchasingApprovalStatusRepository):
    """購買申請ステータスを取得するRepository"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_submitted_code(self, query_code: str) -> PurchasingApprovalStatus | None:
        return self.db.scalar(select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == query_code))
