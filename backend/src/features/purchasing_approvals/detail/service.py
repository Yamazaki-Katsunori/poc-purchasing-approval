from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND
from wireup import injectable

from src.features.purchasing_approvals.detail.interfaces import (
    IApprovalDetailEventRepository,
    IApprovalDetailRepository,
    IApprovalDetailStatusRepository,
)
from src.features.purchasing_approvals.detail.schemas import (
    ApprovalDetailResponse,
)
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.shared.enums.approval_actions_enum import ApprovalActionState
from src.shared.enums.approval_status_enum import ApprovalStatusCode


@injectable(lifetime="scoped")
class ApprovalDetailService:
    """申請詳細画面のサービスクラス"""

    def __init__(
        self,
        db: Session,
        approval_repository: IApprovalDetailRepository,
        approval_event_repository: IApprovalDetailEventRepository,
        approval_status_repository: IApprovalDetailStatusRepository,
    ):
        self.db = db
        self.approval_repository = approval_repository
        self.approval_event_repository = approval_event_repository
        self.approval_status_repository = approval_status_repository

    def execute(self, approval_id: int) -> ApprovalDetailResponse:
        """申請詳細画面で該当の申請データを1件取得する処理"""
        approval = self.approval_repository.find_by_id(approval_id)

        if approval is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="対象の申請データが見つかりませんでした。")

        return ApprovalDetailResponse.model_validate(approval)

    def approve(self, approval_id: int, user_id: int) -> PurchasingApproval:
        """申請詳細画面で承認ボタンを押下した際に承認ステータスに更新する処理"""

        with self.db.begin():
            approval = self.approval_repository.find_by_id(approval_id)

            if approval is None:
                raise HTTPException(
                    status_code=HTTP_404_NOT_FOUND,
                    detail="対象の申請データが見つかりませんでした。",
                )

            approve_status = self.approval_status_repository.find_by_code(ApprovalStatusCode.APPROVED.value)

            if approve_status is None:
                raise ValueError(f"{ApprovalStatusCode.APPROVED.value.upper()} status not found")

            now = datetime.now(UTC)
            approval.current_status_id = approve_status.id
            approval.approved_at = now
            saved_approval = self.approval_repository.save(approval)

            event = PurchasingApprovalEvent(
                subject_type="approval",
                subject_id=saved_approval.id,
                performed_by=user_id,
                status_id=approve_status.id,
                action=ApprovalActionState.APPROVE.value,
                comment=None,
                event_at=now,
            )
            created_event = self.approval_event_repository.create(event)

            updated_approval = self.approval_repository.update_current_event_id(
                approval=saved_approval,
                approval_event_id=created_event.id,
            )

        self.db.refresh(updated_approval)
        return updated_approval
