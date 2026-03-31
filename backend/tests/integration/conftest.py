# tests/integration/conftest.py

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from src.db.base import Base
from src.db.config import build_postgresql_database_url
from src.db.session import make_db_session
from src.main import app
from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.models.user import User
from src.shared.enums.approval_status_enum import ApprovalStatusCode  # 例: PENDING を持つ Enum
from src.shared.security import create_access_token

engine = create_engine(
    url=build_postgresql_database_url(),
    echo=False,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    autocommit=False,
)


# @pytest.fixture(scope="session", autouse=True)
# def setup_database():
#     Base.metadata.drop_all(bind=engine)
#     Base.metadata.create_all(bind=engine)
#     yield
#     Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session() -> Iterator[Session]:
    with TestingSessionLocal() as session:
        yield session


@pytest.fixture()
def client(db_session: Session) -> Iterator[TestClient]:
    def override_make_db_session() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[make_db_session] = override_make_db_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def seed_user(db_session: Session) -> User:
    user = db_session.scalar(select(User).where(User.email == "applicant@example.com"))
    print(f"get_user_data: {user}")

    assert user is not None
    return user


@pytest.fixture()
def pending_status(db_session: Session) -> PurchasingApprovalStatus:
    status = db_session.scalar(select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == "submitted"))
    assert status is not None
    return status


@pytest.fixture()
def access_token(seed_user: User) -> str:
    return create_access_token(str(seed_user.id))
