# tests/integration/features/approvals/confirm/test_create_approval_endpoint.py

from sqlalchemy import select
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR

from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent


def test_create_approval_success(
    db_session, seed_user, submitted_status, authenticated_client, cleanup_approval_tables
):
    """正常系: 購買申請新規登録処理の成功テスト"""

    payload = {
        "title": "モニター購入_intagration_test",
        "amount": 50000,
        "reason": "業務効率化のため_integration_test",
        "purchase_type": "equipment",
    }

    response = authenticated_client.post(
        "/approvals/confirm",
        json=payload,
    )

    assert response.status_code in (200, 201)

    approval = db_session.scalar(
        select(PurchasingApproval).where(PurchasingApproval.title == "モニター購入_intagration_test")
    )
    assert approval is not None
    assert approval.user_id == seed_user.id
    assert approval.amount == 50_000
    assert approval.current_status_id == submitted_status.id
    assert approval.current_event_id is not None

    event = db_session.scalar(
        select(PurchasingApprovalEvent).where(PurchasingApprovalEvent.id == approval.current_event_id)
    )
    assert event is not None
    assert event.performed_by == seed_user.id
    assert event.status_id == submitted_status.id

    assert approval.current_event_id == event.id


def test_create_approval_endpoint_returns_401_when_not_authenticated(client):
    """異常系: access_token がない場合は 401 を返す"""

    payload = {
        "title": "test_購入_integration_test",
        "amount": 10_000,
        "reason": "異常系のテスト_アクセストークンなし_integration_test",
        "purchase_type": "equipment",
    }

    response = client.post(
        "/approvals/confirm",
        json=payload,
    )

    assert response.status_code == HTTP_401_UNAUTHORIZED


def test_create_approval_endpoint_returns_500_when_submitted_status_not_found(
    authenticated_client,
    monkeypatch,
):
    """異常系: approval_statuses に submitted が存在しない場合は 500 を返す"""

    def mock_find_by_submitted_code(self, code: str):
        return None

    monkeypatch.setattr(
        "src.features.purchasing_approvals.confirm.repository.PurchasingApprovalStatusRepository.find_by_submitted_code",
        mock_find_by_submitted_code,
    )

    payload = {
        "title": "test_購入_part3_integration_test",
        "amount": 15_000,
        "reason": "異常系のテスト_submitted未登録_integration_test",
        "purchase_type": "equipment",
    }

    response = authenticated_client.post(
        "/approvals/confirm",
        json=payload,
    )

    assert response.status_code == HTTP_500_INTERNAL_SERVER_ERROR


def test_create_approval_endpoint_returns_500_rollbacks_when_event_creation_failed(
    authenticated_client,
    db_session,
    monkeypatch,
):
    """異常系: purchasing_approval_event 作成失敗時は approval が rollback される"""

    def mock_create_approval_event(self, event):
        raise RuntimeError("failed to create approval event")

    monkeypatch.setattr(
        "src.features.purchasing_approvals.confirm.repository.PurchasingApprovalEventRepository.create_approval_event",
        mock_create_approval_event,
    )

    payload = {
        "title": "test_event_rollback_integration",
        "amount": 20_000,
        "reason": "event作成失敗時のrollback確認",
        "purchase_type": "equipment",
    }

    response = authenticated_client.post(
        "/approvals/confirm",
        json=payload,
    )

    assert response.status_code == HTTP_500_INTERNAL_SERVER_ERROR

    # NOTE: approvalテーブルに該当のペイロードデータが作成されていないことを検証
    created_approval = db_session.scalar(
        select(PurchasingApproval).where(PurchasingApproval.title == "test_event_rollback_integration")
    )
    assert created_approval is None


def test_create_approval_endpoint_returns_500_when_approval_creation_failed(
    authenticated_client,
    db_session,
    monkeypatch,
):
    """異常系: approval 作成失敗時は 500 を返す"""

    def mock_create_approval(self, approval):
        raise RuntimeError("failed to create approval")

    monkeypatch.setattr(
        "src.features.purchasing_approvals.confirm.repository.PurchasingApprovalRepository.create_approval",
        mock_create_approval,
    )

    payload = {
        "title": "test_approval_create_failed_integration",
        "amount": 30_000,
        "reason": "approval作成失敗時の異常系確認",
        "purchase_type": "equipment",
    }

    response = authenticated_client.post(
        "/approvals/confirm",
        json=payload,
    )

    assert response.status_code == HTTP_500_INTERNAL_SERVER_ERROR

    created_approval = db_session.scalar(
        select(PurchasingApproval).where(PurchasingApproval.title == "test_approval_create_failed_integration")
    )
    assert created_approval is None
