import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend project (event-registration-backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from the backend root
load_dotenv(BASE_DIR / '.env')


def resolve_path(env_val: str, default_relative: str) -> str:
    """Ensure path from environment or default is always resolved as an absolute filesystem path."""
    val = env_val.strip() if env_val else default_relative
    if val == ':memory:' or os.path.isabs(val):
        return val
    return str((BASE_DIR / val).resolve())


class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'eventhub-default-secret-key-2026')
    DATABASE_PATH = resolve_path(os.environ.get('DATABASE_PATH', ''), 'database/database.db')
    UPLOAD_FOLDER = resolve_path(os.environ.get('UPLOAD_FOLDER', ''), 'uploads/events')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16 MB max
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # Admin Credentials
    ADMIN_ID = os.environ.get('ADMIN_ID', 'ADMIN001')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'EventHub@2026')

    # SMTP Configuration (Supports SMTP_HOST or SMTP_SERVER, SMTP_FROM_EMAIL or MAIL_DEFAULT_SENDER)
    SMTP_SERVER = os.environ.get('SMTP_HOST') or os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'true').lower() in ('true', '1', 'yes')
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    MAIL_DEFAULT_SENDER = (
        os.environ.get('SMTP_FROM_EMAIL')
        or os.environ.get('MAIL_DEFAULT_SENDER', 'EventHub College <no-reply@eventhub.college.edu>')
    )

    # Testing flag
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DATABASE_PATH = str((BASE_DIR / 'database' / 'test_database.db').resolve())
    UPLOAD_FOLDER = str((BASE_DIR / 'tests' / 'test_uploads').resolve())
    SECRET_KEY = 'test-secret-key'
