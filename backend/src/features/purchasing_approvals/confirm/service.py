from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session
from wireup import injectable

from src.features.purchasing_approvals.confirm.interfaces import (
    IPurchasingApprovalEventRepository,
    IPurchasingApprovalRepository,
)
from src.features.purchasing_approvals.confirm.schemas import ConfirmApprovalRequest
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus


@injectable(lifetime="scoped")
class CreateApprovalService:
    def __init__(
        self,
        db: Session,
        approval_repository: IPurchasingApprovalRepository,
        approval_event_repository: IPurchasingApprovalEventRepository,
    ) -> None:
        self.db = db
        self.approval_repository = approval_repository
        self.approval_event_repository = approval_event_repository

    def create_approval_action(
        self,
        user_id: int,
        data: ConfirmApprovalRequest,
    ) -> PurchasingApproval:
        pending_status = self.db.scalar(
            select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == "PENDING")
        )

        if pending_status is None:
            raise ValueError("PENDING status not found")

        now = datetime.now(UTC)

        approval = PurchasingApproval(
            user_id=user_id,
            title=data.title,
            purchase_type=data.purchase_type,
            amount=data.amount,
            reason=data.reason,
            current_status_id=pending_status.id,
            current_event_id=None,
            requested_at=now,
        )
        approval = self.approval_repository.create_approval(approval)

        event = PurchasingApprovalEvent(
            subject_type="approval",
            subject_id=approval.id,
            performed_by=user_id,
            status_id=pending_status.id,
            action="REQUEST",
            comment=None,
            event_at=now,
        )
        event = self.approval_event_repository.create_approval_event(event)

        approval = self.approval_repository.update_current_event_id(
            approval=approval,
            approval_event_id=event.id,
        )

        return approval
