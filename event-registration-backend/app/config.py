
import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory: event-registration-backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment files
for env_path in [
    BASE_DIR / ".env.local",
    BASE_DIR / ".env",
    BASE_DIR.parent / ".env.local",
    BASE_DIR.parent / ".env",
]:
    if env_path.is_file():
        load_dotenv(env_path)


def resolve_path(env_val: str, default_relative: str) -> str:
    """Resolve paths relative to the backend directory."""
    val = env_val.strip() if env_val else default_relative

    if val == ":memory:" or os.path.isabs(val):
        return val

    return str((BASE_DIR / val).resolve())


def get_normalized_database_url() -> str:
    """Normalize PostgreSQL database URLs."""
    raw_url = os.environ.get("DATABASE_URL", "").strip()

    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql://", 1)

    return raw_url


class Config:
    """Application configuration."""

    SECRET_KEY = os.environ.get(
        "SECRET_KEY", "eventhub-default-secret-key-2026"
    )

    DATABASE_URL = get_normalized_database_url()
    DATABASE_PATH = resolve_path(
        os.environ.get("DATABASE_PATH", ""),
        "database/database.db",
    )
    UPLOAD_FOLDER = resolve_path(
        os.environ.get("UPLOAD_FOLDER", ""),
        "uploads/events",
    )

    MAX_CONTENT_LENGTH = int(
        os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
    )
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    # Admin credentials
    ADMIN_ID = os.environ.get("ADMIN_ID", "ADMIN001")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "EventHub@2026")

    # Gmail SMTP configuration
    SMTP_SERVER = os.environ.get(
        "SMTP_HOST",
        os.environ.get("SMTP_SERVER", "smtp.gmail.com"),
    )
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() in (
        "true", "1", "yes"
    )
    SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

    MAIL_DEFAULT_SENDER = (
        os.environ.get("SMTP_FROM_EMAIL")
        or os.environ.get("MAIL_DEFAULT_SENDER")
        or os.environ.get("SMTP_USERNAME", "")
    )

    TESTING = False


class TestingConfig(Config):
    """Configuration for automated tests."""

    TESTING = True
    DATABASE_URL = ""
    DATABASE_PATH = str(
        (BASE_DIR / "database" / "test_database.db").resolve()
    )
    UPLOAD_FOLDER = str(
        (BASE_DIR / "tests" / "test_uploads").resolve()
    )
    SECRET_KEY = "test-secret-key"
