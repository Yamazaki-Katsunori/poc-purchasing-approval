from datetime import UTC, datetime

from sqlalchemy.orm import Session
from wireup import injectable

from src.features.purchasing_approvals.confirm.interfaces import (
    IPurchasingApprovalEventRepository,
    IPurchasingApprovalRepository,
    IPurchasingApprovalStatusRepository,
)
from src.features.purchasing_approvals.confirm.schemas import ConfirmApprovalRequest
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.shared.enums.approval_actions_enum import ApprovalActionState
from src.shared.enums.approval_status_enum import ApprovalStatusCode


@injectable(lifetime="scoped")
class CreateApprovalService:
    def __init__(
        self,
        db: Session,
        approval_repository: IPurchasingApprovalRepository,
        approval_event_repository: IPurchasingApprovalEventRepository,
        approval_status_repository: IPurchasingApprovalStatusRepository,
    ) -> None:
        self.db = db
        self.approval_repository = approval_repository
        self.approval_event_repository = approval_event_repository
        self.approval_status_repository = approval_status_repository

    def create_approval_action(
        self,
        user_id: int,
        data: ConfirmApprovalRequest,
    ) -> PurchasingApproval:

        try:
            with self.db.begin():
                submitted_status = self.approval_status_repository.find_by_submitted_code(
                    ApprovalStatusCode.SUBMITTED.value
                )

                if submitted_status is None:
                    raise ValueError(f"{ApprovalStatusCode.SUBMITTED.value.upper()} status not found")

                now = datetime.now(UTC)
                approval = PurchasingApproval(
                    user_id=user_id,
                    title=data.title,
                    purchase_type=data.purchase_type,
                    amount=data.amount,
                    reason=data.reason,
                    current_status_id=submitted_status.id,
                    current_event_id=None,
                    requested_at=now,
                )
                approval = self.approval_repository.create_approval(approval)

                event = PurchasingApprovalEvent(
                    subject_type="approval",
                    subject_id=approval.id,
                    performed_by=user_id,
                    status_id=submitted_status.id,
                    action=ApprovalActionState.REQUEST.value,
                    comment=None,
                    event_at=now,
                )
                event = self.approval_event_repository.create_approval_event(event)

                approval = self.approval_repository.update_current_event_id(
                    approval=approval,
                    approval_event_id=event.id,
                )
            self.db.refresh(approval)
            return approval

        except Exception:
            raise
