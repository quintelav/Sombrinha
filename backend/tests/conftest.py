"""Shared test setup with isolated file-based storage."""

import os
import sys
from pathlib import Path

import pytest


BACKEND_DIRECTORY = Path(__file__).resolve().parents[1]
if str(BACKEND_DIRECTORY) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIRECTORY))

# app.py creates its WSGI application at import time. Disable .env loading and
# PostgreSQL selection before importing it so collection stays self-contained.
os.environ["PYTHON_DOTENV_DISABLED"] = "true"
os.environ.pop("DATABASE_URL", None)

import app as backend_app  # noqa: E402
from models import recycle_model, report_model  # noqa: E402


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Create a Flask test client whose JSON files live only in tmp_path."""
    monkeypatch.setenv("PYTHON_DOTENV_DISABLED", "true")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setattr(report_model, "DATA_FILE", tmp_path / "reports.json")
    monkeypatch.setattr(recycle_model, "DATA_FILE", tmp_path / "trades.json")

    application = backend_app.create_app()
    application.config.update(TESTING=True)
    return application.test_client()
