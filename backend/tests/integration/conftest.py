# tests/integration/conftest.py

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.models.user import User
from src.shared.enums.approval_status_enum import ApprovalStatusCode
from src.shared.security import create_access_token


@pytest.fixture()
def seed_user(db_session: Session) -> User:
    user = db_session.scalar(select(User).where(User.email == "applicant@example.com"))
    print(f"get_user_data: {user}")

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
