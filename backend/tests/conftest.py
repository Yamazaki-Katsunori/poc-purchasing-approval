from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.db.config import build_postgresql_database_url
from src.db.session import make_db_session
from src.main import app

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


@pytest.fixture()
def db_session() -> Iterator[Session]:
    with TestingSessionLocal() as session:
        yield session


@pytest.fixture(autouse=True)
def client(db_session: Session) -> Iterator[TestClient]:
    def override_make_db_session() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[make_db_session] = override_make_db_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
