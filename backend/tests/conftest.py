from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.db.config import build_postgresql_database_url
from src.main import app
from src.shared.container import container

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
    """testで利用するdb_session
    終了時に rollback / session & connectionを終了する
    """

    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(autouse=True)
def client(db_session: Session) -> Iterator[TestClient]:
    """WireUpDIコンテナのSessionをテスト用のSessionに差し替える"""
    with container.override.injectable(target=Session, new=db_session):
        with TestClient(app) as test_client:
            yield test_client
