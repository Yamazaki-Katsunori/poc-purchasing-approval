# tests/integration/conftest.py

from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.models.user import User
from src.shared.enums.approval_status_enum import ApprovalStatusCode
from src.shared.security import create_access_token


@pytest.fixture()
def seed_user(db_session: Session) -> User:
    user = db_session.scalar(select(User).where(User.email == "applicant@example.com"))

    assert user is not None
    return user


@pytest.fixture()
def submitted_status(db_session: Session) -> PurchasingApprovalStatus:
    status = db_session.scalar(
        select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == ApprovalStatusCode.SUBMITTED.value)
    )
    assert status is not None
    return status


@pytest.fixture()
def access_token(seed_user: User) -> str:
    return create_access_token(str(seed_user.id))


@pytest.fixture()
def authenticated_client(client, access_token: str):
    client.cookies.set("access_token", access_token)
    yield client
    client.cookies.clear()


@pytest.fixture()
def create_approvals(db_session: Session) -> Callable[..., list[PurchasingApproval]]:
    """申請一覧のintegrationテスト用のヘルパー
    引数でテスト用の申請データ件数を指定してテストデータを生成する
    """

    def _create(
        *,
        user: User,
        status: PurchasingApprovalStatus,
        count: int,
    ) -> list[PurchasingApproval]:
        now = datetime.now(UTC)
        approvals: list[PurchasingApproval] = []

        for i in range(count):
            requested_at = now - timedelta(minutes=i)

            approval = PurchasingApproval(
                user_id=user.id,
                title=f"一覧確認用申請 {i + 1}",
                purchase_type="備品購入",
                amount=Decimal("1000") + Decimal(i),
                reason=f"一覧確認用の理由 {i + 1}",
                current_status_id=status.id,
                current_event_id=None,
                requested_at=requested_at,
                approved_at=None,
            )
            db_session.add(approval)
            db_session.flush()

            event = PurchasingApprovalEvent(
                subject_type="approval",
                subject_id=approval.id,
                performed_by=user.id,
                status_id=status.id,
                action="submit",
                comment="integration test seed",
                event_at=requested_at,
            )
            db_session.add(event)
            db_session.flush()

            approval.current_event_id = event.id
            approvals.append(approval)

        db_session.flush()
        return approvals

    return _create


@pytest.fixture()
def cleanup_approval_tables(db_session: Session):
    # テスト前 cleanup
    print("cleanup before")
    db_session.execute(delete(PurchasingApprovalEvent))
    db_session.execute(delete(PurchasingApproval))
    db_session.commit()

    yield

    # テスト後 cleanup
    print("cleanup after")
    db_session.execute(delete(PurchasingApprovalEvent))
    db_session.execute(delete(PurchasingApproval))
    db_session.commit()
