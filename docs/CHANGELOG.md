# Changelog & Version History

All notable changes to the **EventHub — College Event Registration System** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — Phase 2 & 3 Roadmap

### Planned (Phase 2 — Flask + SQLite Backend)
- Python Flask backend service with modular blueprints (`events`, `registrations`, `admin`).
- SQLite database initialization with relational integrity and `UNIQUE(event_id, email)` constraint.
- SMTP email confirmation delivery on successful registration.
- Comprehensive PyTest suite with isolated in-memory testing.

### Planned (Phase 3 — DevOps & CI/CD Pipeline)
- Git & GitHub repository webhook triggers.
- Jenkins Declarative Pipeline (`Jenkinsfile`).
- Automated dependency caching and PyTest execution stage.
- SonarQube static code analysis, code coverage, and quality gate verification.
- Local server deployment stage.

---

## [0.2.0] - 2026-09-30

### Added
- Created centralized technical documentation suite under `docs/`:
  - [`BACKEND_INTEGRATION.md`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/docs/BACKEND_INTEGRATION.md): React ↔ Flask communication standards, field mapping, and CORS guide.
  - [`API_CONTRACT.md`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/docs/API_CONTRACT.md): Comprehensive REST API payload schemas and error specifications.
  - [`DATABASE_SCHEMA.md`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/docs/DATABASE_SCHEMA.md): SQLite schema DDL, constraints, indices, and seed data.
  - [`BACKEND_HANDOVER.md`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/docs/BACKEND_HANDOVER.md): Developer architecture guide and onboarding handbook.
  - [`DEVELOPMENT_SETUP.md`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/docs/DEVELOPMENT_SETUP.md): Step-by-step instructions for running frontend and backend locally.
  - [`CHANGELOG.md`](file:///c:/Users/Soham%20Palkar/OneDrive/Desktop/DevOps%20Project%20-Event%20Management/docs/CHANGELOG.md): Chronological project history and release log.

### Enhanced
- Modernized UI theme tokens in `src/index.css` using modern typography, card hover dynamics, and Tailwind CSS v4 styling.
- Upgraded Admin Dashboard with 3-column metric cards and dynamic capacity metrics.
- Upgraded Event Management & Add Event pages with live image previews and responsive table/card layouts.
- Updated `src/services/api.ts` with `VITE_API_BASE_URL` integration and backend-parity error mapping.

---

## [0.1.0] - Initial Release

### Added
- Initial project scaffolding with React 19, TypeScript, Vite, and Tailwind CSS.
- Public pages: Home (`/`), Events Catalog (`/events`), Event Details (`/events/:id`), Registration (`/register/:id`), Registration Success (`/registration-success`).
- Admin portal: Login (`/admin/login`), Dashboard (`/admin/dashboard`), Manage Events (`/admin/events`), Add Event (`/admin/events/new`), Registrations (`/admin/registrations`).
- In-memory mock database (`mockEvents.ts`) with duplicate registration simulation for `soham@gmail.com`.
- Client-side validation and authentication session state management (`auth.ts`).
