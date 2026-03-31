# tests/integration/features/approvals/confirm/test_create_approval_endpoint.py

from sqlalchemy import select

from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent


def test_create_approval_success(client, db_session, seed_user, access_token, pending_status):
    payload = {
        "title": "モニター購入_intagration_test",
        "amount": 50000,
        "reason": "業務効率化のため_integration_test",
        "purchase_type": "equipment",
    }

    response = client.post(
        "/approvals/confirm",
        json=payload,
        cookies={"access_token": access_token},
    )

    assert response.status_code in (200, 201)

    approval = db_session.scalar(
        select(PurchasingApproval).where(PurchasingApproval.title == "モニター購入_intagration_test")
    )
    assert approval is not None
    assert approval.user_id == seed_user.id
    assert approval.amount == 50_000
    assert approval.current_status_id == pending_status.id
    assert approval.current_event_id is not None

    event = db_session.scalar(
        select(PurchasingApprovalEvent).where(PurchasingApprovalEvent.id == approval.current_event_id)
    )
    assert event is not None
    assert event.performed_by == seed_user.id
    assert event.status_id == pending_status.id

    assert approval.current_event_id == event.id
