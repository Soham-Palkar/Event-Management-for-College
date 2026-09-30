# Local Development Setup Guide

This guide describes how to set up, configure, and run both the **React Frontend** and **Flask Backend** on a local development machine (Windows / macOS / Linux).

---

## 1. Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
- **Git**: v2.30+ ([Download Git](https://git-scm.com/))

---

## 2. Project Repository Structure

```text
DevOps Project -Event Management/
│
├── docs/                        # Technical specifications & architecture contracts
├── PROJECT_SCOPE.md             # Project requirements & DevOps pipeline scope
│
├── event-registration-frontend/ # React + TypeScript + Vite UI
│
└── event-registration-backend/  # Python Flask + SQLite REST API (Phase 2)
```

---

## 3. Frontend Setup (React + Vite)

### Step 1: Navigate to frontend directory
```bash
cd event-registration-frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment (Optional)
If running with mock data (default), no `.env` is needed. When connecting to Flask:
```bash
cp .env.example .env
```
Inside `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Start development server
```bash
npm run dev
```
The application will launch at: **`http://localhost:5173`**

### Step 5: Validate build
```bash
npm run build
```

---

## 4. Backend Setup (Flask + SQLite)

### Step 1: Navigate to backend directory
```bash
cd event-registration-backend
```

### Step 2: Create and activate virtual environment
**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Create environment file
```bash
cp .env.example .env
```

### Step 5: Run tests
```bash
pytest
```

### Step 6: Start Flask API server
```bash
python run.py
```
The REST API will run at: **`http://localhost:5000/api`**

---

## 5. End-to-End Verification Checklist

| Test Item | Action | Expected Result |
| :--- | :--- | :--- |
| **Public Catalog** | Open `http://localhost:5173/events` | Displays event cards with dates, badges, and seats |
| **Event Details** | Click any event card | Displays venue, time, capacity, and "Register" button |
| **Registration** | Register with student name & ID | Success page with confirmation prompt |
| **Duplicate Prevention**| Register again with same email | Displays *"Already registered for this event"* warning |
| **Admin Portal** | Login at `/admin/login` (`ADMIN001` / `EventHub@2026`) | Opens Admin Dashboard with metrics |
| **Event Creation** | Create event at `/admin/events/new` | Event appears in catalog and admin table |
| **Event Deletion** | Delete an event from `/admin/events` | Event removed and registrations pruned |

---

## 6. Common Troubleshooting

### Port 5173 or Port 5000 Already in Use:
- **Frontend**: Vite automatically falls back to port `5174`. Update backend CORS origin or kill the process on port `5173`.
- **Backend**: Set `PORT=5001` in `.env` and update `VITE_API_BASE_URL` in the frontend `.env`.

### PowerShell Script Execution Policy Error:
If `Activate.ps1` is blocked by PowerShell execution policy, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### CORS Issues:
Ensure `flask-cors` is enabled in `app/__init__.py` allowing `http://localhost:5173` or wildcard origins in local development.
