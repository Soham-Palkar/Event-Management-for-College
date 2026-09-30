# EventHub — Python Flask & SQLite Backend

Phase 2 REST API backend for the **EventHub** College Event Registration System. Built with Python, Flask, and SQLite with automated email dispatch and PyTest test suite.

---

## 🚀 Features

- **REST API**: Complete endpoints for event management, student registrations, and administrative login.
- **Relational SQLite Database**: Auto-initialized schema with `UNIQUE(event_id, email)` duplicate registration prevention and cascading deletions.
- **Image Upload Pipeline**: Supports `multipart/form-data` uploads saved to `uploads/events/` and served statically.
- **SMTP Email Notifications**: Automated registration receipts sent to students upon registration.
- **Automated Testing Suite**: 100% passing PyTest test suite with in-memory database isolation.

---

## 🛠️ Local Setup & Execution

### 1. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
cd event-registration-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd event-registration-backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run PyTest Suite
```bash
pytest -v
```

### 4. Start Development Server
```bash
python run.py
```
The REST API will be accessible at: `http://localhost:5000/api`

---

## 🧭 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/events` | List all events (with computed `registeredCount`) |
| `GET` | `/api/events/<id>` | Retrieve specific event details |
| `POST` | `/api/events` | Create an event (JSON or `multipart/form-data` with image) |
| `DELETE` | `/api/events/<id>` | Delete an event and cascade registrations |
| `POST` | `/api/registrations` | Register student (validates capacity & duplicate emails) |
| `GET` | `/api/registrations` | List all registrations (filter with `?eventId=`) |
| `POST` | `/api/admin/login` | Authenticate admin credentials |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/uploads/events/<file>`| Static file serving for uploaded event posters |

---

## 🔐 Default Admin Credentials

- **Admin ID**: `ADMIN001`
- **Password**: `EventHub@2026`
*(Configurable via `.env`)*
