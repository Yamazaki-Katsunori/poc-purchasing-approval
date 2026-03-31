from unittest.mock import MagicMock

import pytest

from src.features.purchasing_approvals.confirm.schemas import ConfirmApprovalRequest
from src.features.purchasing_approvals.confirm.service import CreateApprovalService
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.shared.enums.approval_actions_enum import ApprovalActionState
from src.shared.enums.approval_status_enum import ApprovalStatusCode


def test_create_approval_action_success():
    """正常系: 申請とイベントを新規作成して current_event_id を更新する"""

    db = MagicMock()
    approval_repository = MagicMock()
    approval_event_repository = MagicMock()

    pending_status = PurchasingApprovalStatus(
        id=1, code=ApprovalStatusCode.SUBMITTED.value, name=ApprovalStatusCode.SUBMITTED.label
    )
    db.scalar.return_value = pending_status

    created_approval = PurchasingApproval(
        id=10,
        user_id=1,
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
        current_status_id=pending_status.id,
        current_event_id=None,
    )
    approval_repository.create_approval.return_value = created_approval

    created_event = PurchasingApprovalEvent(
        id=100,
        subject_type="approval",
        subject_id=10,
        performed_by=1,
        status_id=pending_status.id,
        action=ApprovalActionState.REQUEST.value,
    )
    approval_event_repository.create_approval_event.return_value = created_event

    updated_approval = PurchasingApproval(
        id=10,
        user_id=1,
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
        current_status_id=pending_status.id,
        current_event_id=created_event.id,
    )
    approval_repository.update_current_event_id.return_value = updated_approval

    service = CreateApprovalService(
        db=db,
        approval_repository=approval_repository,
        approval_event_repository=approval_event_repository,
    )

    request = ConfirmApprovalRequest(
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
    )

    result = service.create_approval_action(user_id=1, data=request)

    assert result is updated_approval
    db.scalar.assert_called_once()
    approval_repository.create_approval.assert_called_once()
    approval_event_repository.create_approval_event.assert_called_once()
    approval_repository.update_current_event_id.assert_called_once()


def test_create_approval_action_raises_value_error_when_pending_status_not_found():
    """異常系: PENDINGステータスが取得できない場合"""

    db = MagicMock()
    approval_repository = MagicMock()
    approval_event_repository = MagicMock()

    db.scalar.return_value = None

    service = CreateApprovalService(
        db=db,
        approval_repository=approval_repository,
        approval_event_repository=approval_event_repository,
    )

    request = ConfirmApprovalRequest(
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
    )

    with pytest.raises(ValueError, match="SUBMITTED status not found"):
        service.create_approval_action(user_id=1, data=request)

    approval_repository.create_approval.assert_not_called()
    approval_event_repository.create_approval_event.assert_not_called()
    approval_repository.update_current_event_id.assert_not_called()


def test_create_approval_action_raises_runtime_error_when_create_approval_failed():
    """異常系: purchasing_approval の create_approval が失敗する"""

    db = MagicMock()
    approval_repository = MagicMock()
    approval_event_repository = MagicMock()

    pending_status = PurchasingApprovalStatus(
        id=1, code=ApprovalStatusCode.SUBMITTED.value, name=ApprovalStatusCode.SUBMITTED.label
    )
    db.scalar.return_value = pending_status

    approval_repository.create_approval.side_effect = RuntimeError("create approval error")

    service = CreateApprovalService(
        db=db,
        approval_repository=approval_repository,
        approval_event_repository=approval_event_repository,
    )

    request = ConfirmApprovalRequest(
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
    )

    with pytest.raises(RuntimeError, match="create approval error"):
        service.create_approval_action(user_id=1, data=request)

    approval_repository.create_approval.assert_called_once()
    approval_event_repository.create_approval_event.assert_not_called()
    approval_repository.update_current_event_id.assert_not_called()


def test_create_approval_action_raises_runtime_error_when_create_approval_event_failed():
    """異常系: purchasing_approval_event の create_approval_event が失敗する"""

    db = MagicMock()
    approval_repository = MagicMock()
    approval_event_repository = MagicMock()

    pending_status = PurchasingApprovalStatus(
        id=1, code=ApprovalStatusCode.SUBMITTED.value, name=ApprovalStatusCode.SUBMITTED.label
    )
    db.scalar.return_value = pending_status

    created_approval = PurchasingApproval(
        id=10,
        user_id=1,
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
        current_status_id=pending_status.id,
        current_event_id=None,
    )
    approval_repository.create_approval.return_value = created_approval
    approval_event_repository.create_approval_event.side_effect = RuntimeError("create approval event error")

    service = CreateApprovalService(
        db=db,
        approval_repository=approval_repository,
        approval_event_repository=approval_event_repository,
    )

    request = ConfirmApprovalRequest(
        title="MacBook Pro",
        purchase_type="PC",
        amount=250_000,
        reason="開発業務で利用するため",
    )

    with pytest.raises(RuntimeError, match="create approval event error"):
        service.create_approval_action(user_id=1, data=request)

    approval_repository.create_approval.assert_called_once()
    approval_event_repository.create_approval_event.assert_called_once()
    approval_repository.update_current_event_id.assert_not_called()
