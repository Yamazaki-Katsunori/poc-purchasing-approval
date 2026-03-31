# tests/integration/conftest.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from src.db.base import Base
from src.db.session import make_db_session
from src.main import app
from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.models.user import User
from src.shared.enums.approval_status_enum import ApprovalStatusCode  # 例: PENDING を持つ Enum
from src.shared.security import create_access_token

TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/test_db"


engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db_session: Session):
    def override_make_db_session():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[make_db_session] = override_make_db_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def seed_user(db_session: Session) -> User:
    user = db_session.scalar(select(User).where(User.email == "applicant@example.com"))
    assert user is not None
    return user


@pytest.fixture()
def pending_status(db_session: Session) -> PurchasingApprovalStatus:
    status = PurchasingApprovalStatus(
        code=ApprovalStatusCode.SUBMITTED.value,
        name=ApprovalStatusCode.SUBMITTED.label,
    )
    db_session.add(status)
    db_session.flush()
    return status


@pytest.fixture()
def access_token(test_user: User) -> str:
    return create_access_token(str(test_user.id))
