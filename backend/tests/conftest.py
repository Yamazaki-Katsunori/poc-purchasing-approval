from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture
def client() -> Generator[TestClient]:
    """FastAPIのTestClientを返す fixture"""

    with TestClient(app) as test_client:
        yield test_client
