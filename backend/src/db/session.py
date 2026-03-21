import os
from collections.abc import Generator
from typing import Final

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from wireup import injectable

DATABASE_URL: Final[str] = os.getenv("DATABASE_URL", "postgresql+psycopg://app:app@db:5432/app")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    autocommit=False,
)


def _session_scope() -> Generator[Session]:
    """databaseのセッション生成処理

    Returns:
      Generator[Session]: yield db

    """
    with SessionLocal() as db:
        yield db


def get_db() -> Generator[Session]:
    """db_sessionの生成処理

    Returns:
      Generator[Session] : yield form _session_scope()

    """
    yield from _session_scope()


@injectable(lifetime="scoped")
def make_db_session() -> Generator[Session]:
    """db_sessionの生成処理

    Returns:
      Generator[Session] : yield form _session_scope()

    """
    yield from _session_scope()
