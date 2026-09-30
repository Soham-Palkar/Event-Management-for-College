import os
import shutil
from pathlib import Path
import pytest
from app import create_app
from app.config import TestingConfig
from app.database import get_db, close_db


@pytest.fixture
def app():
    """Create and configure a clean Flask application instance for testing."""
    test_upload_dir = Path(TestingConfig.UPLOAD_FOLDER)
    test_upload_dir.mkdir(parents=True, exist_ok=True)
    
    test_db_path = Path(TestingConfig.DATABASE_PATH)
    test_db_path.parent.mkdir(parents=True, exist_ok=True)
    if test_db_path.exists():
        try:
            test_db_path.unlink()
        except PermissionError:
            pass

    app = create_app(TestingConfig)

    # Initialize tables
    schema_path = Path(__file__).resolve().parent.parent / 'database' / 'schema.sql'
    with app.app_context():
        db = get_db()
        with open(schema_path, 'r', encoding='utf-8') as f:
            db.executescript(f.read())
        db.commit()

    yield app

    # Teardown
    with app.app_context():
        close_db()
        
    if test_upload_dir.exists():
        shutil.rmtree(test_upload_dir, ignore_errors=True)
        
    if test_db_path.exists():
        try:
            test_db_path.unlink()
        except PermissionError:
            pass


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def sample_event(app):
    """Insert a sample event into the test database and return its details."""
    with app.app_context():
        db = get_db()
        cursor = db.execute(
            """
            INSERT INTO events (event_name, description, date, time, venue, capacity, category, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "Hackathon 2026",
                "24-hour rapid prototyping hackathon.",
                "2026-11-10",
                "09:00 AM",
                "Computer Science Lab 1",
                2,  # Small capacity for testing capacity limits
                "Technical",
                "https://example.com/hackathon.jpg"
            )
        )
        db.commit()
        event_id = cursor.lastrowid
        return {
            'id': event_id,
            'name': 'Hackathon 2026',
            'capacity': 2
        }
