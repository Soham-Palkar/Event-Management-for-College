# Backend Integration Guide: React ↔ Flask Communication

This document defines how the **React (Vite + TypeScript)** frontend communicates with the **Python (Flask + SQLite)** backend. It outlines the integration architecture, transport rules, CORS requirements, image URL resolution, email delivery, error translation, and switching mechanisms.

---

## 1. Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│              React Frontend (Vite @ :5173)              │
│                                                         │
│  UI Components (Pages, Forms, Cards, Tables)            │
│         │                                               │
│         ▼                                               │
│  API Service Layer (`src/services/api.ts`)              │
│         │                                               │
│         ├─► If VITE_USE_MOCK=true ──► In-Memory Mock    │
│         │                                               │
│         └─► Default (Live Mode)   ──► Fetch API (HTTP)  │
└─────────────────────────┬───────────────────────────────┘
                          │
                   HTTP REST Requests
             (JSON / multipart/form-data)
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Flask REST API (Python @ :5000)            │
│                                                         │
│  CORS Middleware (flask-cors)                           │
│         │                                               │
│  Blueprints / Routes (`/api/events`, etc.)              │
│         │                                               │
│  Static Asset Serving (`/uploads/events/<file>`)        │
│         │                                               │
│  SQLite Database (`database/database.db`)               │
│         │                                               │
│  SMTP Service (Email notification dispatch)             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Switching Between Mock and Real Backend

The frontend defaults to live backend mode (`http://localhost:5000/api`) and can be switched via environment variable.

### In `event-registration-frontend/.env`:
- Default: `VITE_API_BASE_URL=http://localhost:5000/api`
- Optional mock override: `VITE_USE_MOCK=true`

---

## 3. Communication Protocols & Standards

| Parameter | Specification |
| :--- | :--- |
| **Base URL** | `http://localhost:5000/api` |
| **Data Format** | JSON (`application/json`) for standard requests |
| **Form Data** | `multipart/form-data` for event creation (URL or file) |
| **Standard Response Envelope** | Direct JSON objects or arrays with HTTP status codes |
| **Authentication** | Simple Admin Credential Verification (`ADMIN001` / `EventHub@2026`) |

---

## 4. Image Handling Pipeline

The system supports both **external image URLs** and **local file uploads**:

### A. External Image URL:
1. Admin enters an image URL (e.g. `https://example.com/banner.jpg`) on the Add Event page.
2. Frontend sends `image` in `FormData`.
3. Backend saves the URL string directly in SQLite (`events.image`).
4. Frontend [`getImageUrl`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/event-registration-frontend/src/utils/image.ts) detects `http://` / `https://` and returns the URL untouched.

### B. Local Uploaded File:
1. Admin selects a file (PNG, JPG, JPEG, WebP, GIF) on the Add Event page.
2. Frontend sends `image` (File object) in `multipart/form-data`.
3. Backend saves the file in `uploads/events/<uuid>_<filename>` and stores relative path `/uploads/events/<filename>` in SQLite.
4. Flask exposes `/uploads/events/<filename>` via `send_from_directory`.
5. Frontend [`getImageUrl`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/event-registration-frontend/src/utils/image.ts) prepends `http://localhost:5000` to the relative path.

---

## 5. SMTP Email Configuration & Gmail App Passwords

When a student registers, the backend sends a confirmation email.

### Required Environment Variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=your-college-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_EMAIL="EventHub College <no-reply@eventhub.college.edu>"
```

### Gmail App Password Setup:
1. Go to your **Google Account** → **Security**.
2. Enable **2-Step Verification** (if not already enabled).
3. Search for **App Passwords** (or under 2-Step Verification → App Passwords).
4. Generate a new App Password named `"EventHub"`.
5. Copy the 16-character code into `SMTP_PASSWORD` (do not use your personal Gmail password).

### Safe Error Tolerance:
- If SMTP credentials are blank or invalid, the error is logged to the console (`[EMAIL] Failed to send...`), but the **student registration succeeds and is saved in SQLite**.
