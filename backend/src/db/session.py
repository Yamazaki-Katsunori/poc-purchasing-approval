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
    with SessionLocal() as db:
        yield db


def get_db() -> Generator[Session]:
    yield from _session_scope()


@injectable(lifetime="scoped")
def make_db_session() -> Generator[Session]:
    yield from _session_scope()
