# Backend Handover & Developer Architecture Guide

This document is the **technical onboarding guide** for backend developers tasked with building, testing, and maintaining the Python/Flask backend for **EventHub**.

---

## 1. System Goals & Design Principles

1. **Lightweight & Modular**: Use Flask blueprints for clean separation of concerns (`events`, `registrations`, `admin`).
2. **Database Simplicity**: Utilize SQLite (`database.db`) with zero external DB dependencies for seamless local testing and simple CI/CD execution.
3. **Strict Business Validation**:
   - Duplicate prevention: enforce `UNIQUE(event_id, email)` and return HTTP `409 Conflict`.
   - Capacity constraint: Reject registrations when `registeredCount >= capacity`.
4. **Email Confirmation**: Send clear, formatted text/HTML receipts via SMTP.
5. **CI/CD Ready**: PyTest suite executable via a single CLI command (`pytest`) with high test coverage suitable for Jenkins and SonarQube.

---

## 2. Target Project Structure

```text
event-registration-backend/
│
├── app/
│   ├── __init__.py          # Flask app factory, CORS init, blueprint registration
│   ├── config.py            # App configurations (secret keys, DB path, SMTP credentials)
│   ├── database.py          # SQLite connection manager, schema migrations, helpers
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── events.py        # /api/events GET, POST, DELETE, GET /:id
│   │   ├── registrations.py # /api/registrations POST, GET
│   │   └── admin.py         # /api/admin/login POST
│   │
│   └── services/
│       ├── __init__.py
│       └── email_service.py # SMTP email sender
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # PyTest fixtures (test client, in-memory test DB)
│   ├── test_events.py       # CRUD & validation tests for events
│   ├── test_registrations.py# Duplicate registration & capacity tests
│   └── test_admin.py        # Auth & security tests
│
├── database/
│   ├── schema.sql           # DDL schema definitions
│   └── database.db          # SQLite file (created automatically on startup)
│
├── .env.example             # Example environment variables
├── .gitignore
├── requirements.txt         # Python package dependencies
├── run.py                   # Entry point for development server
└── README.md                # Backend setup guide
```

---

## 3. Core Modules & Responsibilities

### 3.1 `app/__init__.py` (Application Factory)
- Instantiates the Flask app via `create_app(config_class)`.
- Configures `flask_cors.CORS` for cross-origin requests from React (`localhost:5173`).
- Registers Blueprints (`events_bp`, `registrations_bp`, `admin_bp`) under the `/api` prefix.
- Initializes database tables if not already present.

### 3.2 `app/database.py` (Database Layer)
- Manages SQLite connection pooling/context per request using `sqlite3.connect` and `flask.g`.
- Configures `conn.row_factory = sqlite3.Row` so query results can be serialized directly to dictionaries.
- Executes `PRAGMA foreign_keys = ON;`.
- Provides query helpers (`query_db`, `execute_db`).

### 3.3 `app/services/email_service.py` (SMTP Dispatcher)
- Reads SMTP settings (`SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_DEFAULT_SENDER`) from config.
- Formats email with student name, event title, date, time, and venue.
- Sends message via `smtplib.SMTP` / `smtplib.SMTP_SSL`.
- In test environments or when SMTP credentials are unset, mocks/logs the email without crashing the request.

---

## 4. Dependencies (`requirements.txt`)

```text
Flask>=3.0.0
flask-cors>=4.0.0
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-cov>=4.1.0
```

---

## 5. Environment Configuration (`.env`)

```env
FLASK_ENV=development
FLASK_APP=run.py
PORT=5000
SECRET_KEY=dev-secret-key-change-in-prod

# Admin Credentials
ADMIN_ID=ADMIN001
ADMIN_PASSWORD=EventHub@2026

# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-college-email@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER="EventHub College <no-reply@eventhub.college.edu>"
```

---

## 6. Testing Guide with PyTest

Backend tests must run cleanly without dependencies on external services or live network connections:

- **Database Isolation**: Tests use an in-memory SQLite database (`:memory:`) or a temporary file created in `conftest.py`.
- **Mocking Email**: `email_service.send_confirmation_email` is mocked using `unittest.mock.patch` during test execution.

### Running PyTest:
```bash
pytest -v --cov=app tests/
```

### Critical Test Cases to Maintain:
1. `test_get_events_empty_and_populated`
2. `test_get_event_by_id_success_and_404`
3. `test_create_event_valid_and_invalid`
4. `test_delete_event_cascades_registrations`
5. `test_registration_success_returns_201`
6. `test_duplicate_registration_returns_409`
7. `test_event_capacity_full_returns_409`
8. `test_admin_login_success_and_failure`
