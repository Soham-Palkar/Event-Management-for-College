# EventHub — College Event Registration System

Phase 1 frontend for the college EventHub event management and student registration platform. Built with React 19, TypeScript, Vite, and Tailwind CSS. Structured for seamless integration with the upcoming Python Flask + SQLite backend.

## 🚀 Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Clean custom design tokens, modern responsive layouts)
- **Icons**: Lucide React
- **Routing**: React Router v7
- **HTTP/Data**: Fetch API with mock fallback & REST API integration ready

---

## 🛠️ Getting Started

### 1. Install dependencies
```bash
cd event-registration-frontend
npm install
```

### 2. Run local development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 🔐 Mock Admin Credentials

These credentials work out of the box for testing the admin panel in mock mode:

- **Admin ID**: `ADMIN001`
- **Password**: `EventHub@2026`

---

## 🧭 Routes Overview

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home** | Hero section, campus highlight card, and upcoming events grid |
| `/events` | **Events** | Searchable & filterable catalog of all college events |
| `/events/:id` | **Event Details** | Comprehensive event details, seat counter & registration CTA |
| `/register/:id` | **Register** | Student registration form with duplicate prevention |
| `/registration-success` | **Success** | Registration confirmation screen with email receipt preview |
| `/admin/login` | **Admin Login** | Secure administrative sign-in portal |
| `/admin/dashboard` | **Dashboard** | Metrics overview (Total Events, Registrations, Seats Available) |
| `/admin/events` | **Manage Events** | Event table with category badges, status, and delete action |
| `/admin/events/new` | **Add Event** | Create new event form with image preview |
| `/admin/registrations`| **Registrations**| Filterable student registrations table |

---

## 🧪 Testing Duplicate Registrations

- In mock mode, `soham@gmail.com` is pre-registered for **Tech Fest 2026** (Event ID: 1).
- Submitting that email for Event ID: 1 displays the user-friendly **"Already registered for this event"** error banner.
- Registering with the same email for a different event (e.g. *AI & Cloud Summit*) will succeed.

---

## 🔌 Connecting to Flask + SQLite Backend

All backend requests are centralized in [`src/services/api.ts`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/event-registration-frontend/src/services/api.ts).

### Switching to Backend Mode:
1. Set `USE_MOCK = false` in `src/services/api.ts` (or provide `VITE_API_BASE_URL` in `.env`).
2. Run your Flask backend on `http://localhost:5000`.

### REST API Endpoints Contract:
- `GET    /api/events` — List all events
- `GET    /api/events/<id>` — Get specific event details
- `POST   /api/events` — Create new event (Supports JSON and `multipart/form-data`)
- `DELETE /api/events/<id>` — Delete an event
- `POST   /api/registrations` — Register a student (validates capacity & duplicate emails)
- `GET    /api/registrations` — List all registrations (optionally filtered by `?eventId=`)
- `POST   /api/admin/login` — Authenticate admin credentials

---

## 📚 Technical Specifications & Contracts

For complete architectural specifications, schemas, and integration guides, see the [`docs/`](../docs) folder:

- 🔄 [Backend Integration Guide (`docs/BACKEND_INTEGRATION.md`)](../docs/BACKEND_INTEGRATION.md)
- 📋 [REST API Contract (`docs/API_CONTRACT.md`)](../docs/API_CONTRACT.md)
- 🗄️ [SQLite Database Schema (`docs/DATABASE_SCHEMA.md`)](../docs/DATABASE_SCHEMA.md)
- 🤝 [Backend Developer Handover (`docs/BACKEND_HANDOVER.md`)](../docs/BACKEND_HANDOVER.md)
- 💻 [Local Development Setup (`docs/DEVELOPMENT_SETUP.md`)](../docs/DEVELOPMENT_SETUP.md)
- 📜 [Project Changelog (`docs/CHANGELOG.md`)](../docs/CHANGELOG.md)

