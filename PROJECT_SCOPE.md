# Event Registration System — Project Scope & Development Plan

> **Single Source of Truth:** This document defines exactly what we are building, what we are not building, the technology stack, project structure, development phases, and final DevOps target.
>
> **Rule:** If a new feature is not listed under "Features to Include", do not add it without first updating this document.

---

## 1. Project Title

**Design and Implementation of an End-to-End DevOps CI/CD Pipeline for an Event Registration System**

---

## 2. Project Objective

Build a simple, professional college Event Registration System.

The application will allow students/users to:

- View available college events.
- View complete event details.
- Register for an event.
- Register only once for the same event using the same email.
- Receive an email confirmation after successful registration.

The application will also provide a simple Admin section where the administrator can:

- Login using a predefined Admin ID and password.
- View all events.
- Add events.
- Delete events.
- View registered participants.

The application will first be developed and tested locally. After the application is working, it will be placed under an end-to-end DevOps pipeline.

---

# 3. Final Target

The final project should demonstrate:

```text
Developer
    ↓
Git
    ↓
GitHub
    ↓
Jenkins
    ↓
Build
    ↓
Automated Testing
    ↓
SonarQube
    ↓
Deployment
    ↓
Event Registration System
```

### Current scope

**Docker is NOT included initially.**

Docker can be considered later as an optional extension after the complete pipeline is working.

---

# 4. Features to Include

## 4.1 Public/User Features

### A. Home Page

Include:

- Professional hero section.
- Short description of the platform.
- "Explore Events" button.
- Upcoming events section.
- Event cards.
- Small platform statistics section.

Example statistics:

- Total events.
- Total registrations.
- Number of categories.

The statistics should remain simple and should not become a complex analytics dashboard.

---

### B. Events Page

Users can view all available events.

Include:

- Event name.
- Date.
- Time.
- Venue.
- Short description.
- Event image/banner.
- Available seats.
- Category.
- View Details button.

Include simple:

- Search by event name.
- Basic category filtering.

Do not create complicated filtering or recommendation systems.

---

### C. Event Details

Each event should have a dedicated details page.

Display:

- Event banner.
- Event name.
- Date.
- Time.
- Venue.
- Description.
- Capacity.
- Registered/available seats.
- Registration status.
- Register button.

Example:

```text
Tech Fest 2026

15 October 2026
10:00 AM
College Auditorium

About the Event
Annual technical event featuring workshops
and technical activities.

Available Seats
72 / 100

[ Register Now ]
```

If registration is closed:

```text
Registration Closed
```

---

### D. Event Registration

Users register without creating an account.

Required fields:

- Full Name
- Email Address
- Student ID

The form must validate:

- Name is not empty.
- Email format is valid.
- Student ID is not empty.

Show a loading state while submitting.

Example:

```text
Full Name *
Email Address *
Student ID *

[ Complete Registration ]
```

---

### E. One Registration Per Email Per Event

This is a core business rule.

A user can register:

```text
soham@gmail.com → Tech Fest
soham@gmail.com → Python Workshop
```

But cannot register twice for the same event:

```text
soham@gmail.com → Tech Fest
soham@gmail.com → Tech Fest ❌
```

The system should show:

```text
Already Registered

This email is already registered for this event.
```

**Important:** The frontend can display the message, but the Flask backend/database must enforce the actual rule.

Recommended database uniqueness rule:

```text
(event_id, email)
```

must be unique.

---

### F. Registration Success

After successful registration, show:

```text
✓ Registration Successful!

You are successfully registered for:

Tech Fest 2026

15 October 2026
10:00 AM
College Auditorium

A confirmation email has been sent to:
user@example.com

[ Back to Events ]
```

No QR code or downloadable ticket is required.

---

### G. Email Confirmation

After successful registration:

```text
Registration
      ↓
Save in SQLite
      ↓
Send confirmation email
      ↓
User receives email
```

The email should contain:

- User name.
- Event name.
- Date.
- Time.
- Venue.
- Confirmation message.

Email sending will be handled by the Flask backend using SMTP.

---

# 5. Admin Features

## 5.1 Admin Login

Use a predefined Admin ID and password.

Example:

```text
Admin ID: ADMIN001
Password: <configured credential>
```

The actual credential should not be hardcoded into frontend production code. It will ultimately be handled by the backend/configuration.

Admin registration is NOT required.

---

## 5.2 Admin Dashboard

Keep the dashboard simple.

Show:

- Total events.
- Total registrations.
- Events.
- Registrations.

Simple sidebar:

```text
Dashboard
Events
Registrations
Logout
```

Do not create complicated analytics.

---

## 5.3 Manage Events

Admin can:

- View events.
- Add an event.
- Delete an event.

Event fields:

- Event Name
- Description
- Date
- Time
- Venue
- Capacity
- Category
- Event Image

A confirmation modal should appear before deleting an event.

---

## 5.4 View Registrations

Admin can view:

- Name
- Email
- Student ID
- Event
- Registration date

A simple event filter may be included.

Do not create complex reports or analytics.

---

# 6. Features Explicitly NOT Included

Do NOT add these unless the project scope is intentionally changed:

- ❌ User account registration.
- ❌ Complex authentication.
- ❌ JWT authentication initially.
- ❌ Role-based access control.
- ❌ Password reset.
- ❌ Payment gateway.
- ❌ QR code tickets.
- ❌ Downloadable tickets.
- ❌ SMS notifications.
- ❌ Chat.
- ❌ Recommendation system.
- ❌ AI features.
- ❌ Complex analytics.
- ❌ Microservices.
- ❌ Kubernetes.
- ❌ Terraform.
- ❌ Ansible.
- ❌ AWS/cloud deployment initially.
- ❌ Docker initially.
- ❌ Redis.
- ❌ MongoDB.
- ❌ Multiple databases.

The objective is to keep the application simple so the team can focus on the DevOps pipeline.

---

# 7. Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Fetch API

## Backend

- Python
- Flask
- SQLite

## Email

- SMTP

## Testing

- PyTest

## Version Control

- Git
- GitHub

## CI/CD

- Jenkins

## Code Quality / Security Analysis

- SonarQube

## Deployment

- Local Windows/WSL server initially

## Future Optional Extension

- Docker

---

# 8. System Architecture

The intended application architecture is:

```text
React Frontend
       ↓
Flask REST API
       ↓
SQLite Database
       ↓
SMTP Email Service
```

The DevOps architecture is:

```text
Developer
    ↓
Git
    ↓
GitHub
    ↓
Jenkins
    ↓
Checkout Code
    ↓
Install Dependencies
    ↓
Build
    ↓
Run PyTest
    ↓
SonarQube Analysis
    ↓
Quality Check
    ↓
Deploy
    ↓
Running Flask Application
```

---

# 9. Frontend Pages

## Public Pages

```text
/
├── Home
├── /events
├── /events/:id
├── /events/:id/register
└── /registration-success
```

## Admin Pages

```text
/admin/login
/admin/dashboard
/admin/events
/admin/events/add
/admin/registrations
```

---

# 10. Frontend Project Structure

```text
event-registration-frontend/
│
├── public/
│   └── images/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventGrid.tsx
│   │   ├── RegistrationForm.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── Button.tsx
│   │
│   ├── components/
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── StatCard.tsx
│   │       ├── EventTable.tsx
│   │       └── RegistrationTable.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Events.tsx
│   │   ├── EventDetails.tsx
│   │   ├── Register.tsx
│   │   ├── RegistrationSuccess.tsx
│   │   ├── AdminLogin.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── ManageEvents.tsx
│   │       ├── AddEvent.tsx
│   │       └── Registrations.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── data/
│   │   └── mockEvents.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Do not create unnecessary files or folders.

---

# 11. Backend Structure

When frontend work is complete, create the Flask backend separately.

Recommended structure:

```text
event-registration-backend/
│
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── events.py
│   │   ├── registrations.py
│   │   └── admin.py
│   │
│   ├── services/
│   │   └── email_service.py
│   │
│   ├── database.py
│   └── config.py
│
├── tests/
│   ├── test_events.py
│   ├── test_registrations.py
│   └── test_admin.py
│
├── database/
│   └── database.db
│
├── requirements.txt
├── run.py
├── .env
├── .gitignore
└── README.md
```

---

# 12. Database Design

Keep the database small.

## EVENTS

```text
EVENTS
-------------------------
id
event_name
description
date
time
venue
capacity
category
image
created_at
```

## REGISTRATIONS

```text
REGISTRATIONS
-------------------------
id
event_id
name
email
student_id
registered_at
```

Core constraint:

```text
UNIQUE(event_id, email)
```

This ensures one email can register only once for a particular event.

---

# 13. Frontend Data Models

```typescript
interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  category: string;
  image?: string;
}

interface Registration {
  id: number;
  eventId: number;
  name: string;
  email: string;
  studentId: string;
  registeredAt: string;
}
```

---

# 14. API Layer

Frontend API calls should be centralized in:

```text
src/services/api.ts
```

Prepare functions such as:

```text
getEvents()
getEvent(id)
registerForEvent(eventId, data)

adminLogin(data)

createEvent(data)
deleteEvent(id)

getRegistrations()
```

Later these will call the Flask API, for example:

```text
http://localhost:5000/api/...
```

Do not put fetch/API calls directly into every component.

---

# 15. API Endpoints — Planned

The exact endpoint implementation can be finalized during backend development, but the target interface is:

```text
GET    /api/events
GET    /api/events/:id

POST   /api/events
DELETE /api/events/:id

POST   /api/registrations
GET    /api/registrations

POST   /api/admin/login
```

The backend should:

- Validate input.
- Check duplicate registration.
- Store registration.
- Send confirmation email.
- Return clear success/error responses.

---

# 16. Development Phases

## Phase 1 — Frontend

Goal:

> Build a professional UI using mock data.

Tasks:

- Set up React + TypeScript + Vite.
- Configure Tailwind CSS.
- Create navbar.
- Create home page.
- Create event listing.
- Create event details.
- Create registration form.
- Create success page.
- Create admin login.
- Create admin dashboard.
- Create event management UI.
- Create registration table.
- Add responsive design.
- Add loading/error/empty states.

---

## Phase 2 — Backend

Goal:

> Connect the frontend to a real Flask + SQLite backend.

Tasks:

- Create Flask project.
- Create SQLite database.
- Create event APIs.
- Create registration API.
- Create admin login API.
- Add duplicate-registration validation.
- Connect frontend API service to Flask.
- Test complete user flow.

---

## Phase 3 — Email

Goal:

> Send confirmation email after successful registration.

Flow:

```text
User Registers
      ↓
Validate
      ↓
Check Duplicate
      ↓
Save Registration
      ↓
Send Email
      ↓
Return Success
```

---

## Phase 4 — Testing

Goal:

> Create automated tests for important application behavior.

Minimum tests:

```text
✓ Home/API works
✓ Events can be retrieved
✓ Event can be created
✓ Event can be deleted
✓ Valid registration works
✓ Invalid registration is rejected
✓ Duplicate registration is rejected
✓ Admin login works
```

Use:

```text
PyTest
```

---

## Phase 5 — Git & GitHub

Goal:

> Store the project in GitHub and establish proper version control.

Basic workflow:

```text
Create/modify code
      ↓
git status
      ↓
git add .
      ↓
git commit
      ↓
git push
      ↓
GitHub
```

Use meaningful commits.

Examples:

```text
feat: add event listing
feat: add registration form
fix: prevent duplicate registration
test: add registration tests
ci: add Jenkins pipeline
```

---

## Phase 6 — Jenkins CI

Goal:

> Automatically test the project whenever code changes.

Target flow:

```text
GitHub Push
     ↓
Jenkins
     ↓
Checkout
     ↓
Install Dependencies
     ↓
Run Tests
     ↓
Build/Validation
```

A failed test should cause the pipeline to fail.

---

## Phase 7 — SonarQube

Goal:

> Add automated code quality/security analysis.

Target:

```text
Jenkins
   ↓
PyTest
   ↓
SonarQube
   ↓
Quality Check
```

The pipeline should clearly show whether the code passes the configured quality gate.

---

## Phase 8 — Deployment

Goal:

> Automatically deploy the working application after successful CI checks.

Final target:

```text
GitHub
   ↓
Jenkins
   ↓
Build
   ↓
Tests
   ↓
SonarQube
   ↓
Deploy
   ↓
Application Running
```

---

# 17. Final Testing Checklist

Before declaring the application complete:

### User

- [ ] Home page loads.
- [ ] Events are displayed.
- [ ] Search works.
- [ ] Event details work.
- [ ] Registration form validates input.
- [ ] Valid registration succeeds.
- [ ] Duplicate email for same event is rejected.
- [ ] Same email can register for another event.
- [ ] Registration confirmation is shown.
- [ ] Confirmation email is sent.

### Admin

- [ ] Admin login works.
- [ ] Invalid admin login is rejected.
- [ ] Dashboard loads.
- [ ] Admin can add event.
- [ ] New event appears.
- [ ] Admin can delete event.
- [ ] Delete confirmation appears.
- [ ] Admin can view registrations.

### DevOps

- [ ] Code is on GitHub.
- [ ] Jenkins can checkout repository.
- [ ] Dependencies install automatically.
- [ ] Automated tests run.
- [ ] Failed tests fail the Jenkins build.
- [ ] SonarQube analysis runs.
- [ ] Deployment works after successful pipeline.

---

# 18. UI/UX Rules

The frontend must be:

- Professional.
- Clean.
- Responsive.
- Easy to understand.
- Consistent.
- Accessible.
- Lightweight.

Avoid:

- Excessive animations.
- Excessive gradients.
- Excessive glassmorphism.
- Huge dashboards.
- Unnecessary charts.
- Unnecessary popups.
- Complicated navigation.
- AI-generated-looking generic layouts.

Priority:

```text
Professional UI
      >
Simple architecture
      >
Reusable components
      >
Unnecessary features
```

---

# 19. Team Rule

Before adding a new feature, ask:

1. Is it required for event registration?
2. Is it required for the DevOps demonstration?
3. Does it make the project meaningfully better?
4. Will it significantly increase development complexity?

If the answer is no, do not add it.

---

# 20. Current Milestone

**We are currently at: Phase 1 — Frontend Development.**

Do NOT start Jenkins or Docker yet.

Current target:

```text
React Frontend
     ↓
Mock Event Data
     ↓
Professional UI
     ↓
Complete User Flow
     ↓
Complete Admin UI
```

After the frontend is stable:

```text
Frontend
   ↓
Flask Backend
   ↓
SQLite
   ↓
Email
   ↓
PyTest
   ↓
GitHub
   ↓
Jenkins
   ↓
SonarQube
   ↓
Deployment
```

---

# 21. Definition of Done

The project is complete when:

1. A user can view events.
2. A user can view event details.
3. A user can register for an event.
4. The same email cannot register twice for the same event.
5. A user can register for multiple different events.
6. A confirmation email is sent after successful registration.
7. Admin can log in with predefined credentials.
8. Admin can add/delete events.
9. Admin can view registrations.
10. The frontend and backend work together.
11. Automated tests pass.
12. GitHub contains the source code.
13. Jenkins automatically runs the CI pipeline.
14. SonarQube performs code analysis.
15. Successful builds are deployed automatically.

---

# 22. Important Reminder

This is a **DevOps mini-project**, not a large-scale event-management product.

The application should remain simple.

The main story of the project is:

> **Build a small real-world web application and demonstrate how DevOps practices automate testing, code-quality checking, and deployment.**

Do not allow application features to become so complex that they take focus away from the DevOps pipeline.
