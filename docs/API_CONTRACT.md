# API Contract Specification

This document defines the exact HTTP endpoints, payload formats, HTTP status codes, and error models for the **EventHub** REST API.

---

## Table of Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | List all available events | No |
| `GET` | `/api/events/<id>` | Get details of a single event | No |
| `POST` | `/api/events` | Create a new event | Yes (Admin) |
| `DELETE`| `/api/events/<id>` | Delete an event | Yes (Admin) |
| `POST` | `/api/registrations` | Register a student for an event | No |
| `GET` | `/api/registrations` | List all registrations (optional `?eventId=`) | Yes (Admin) |
| `POST` | `/api/admin/login` | Authenticate admin credentials | No |

---

## 1. Events Endpoints

### 1.1 `GET /api/events`
Retrieve all events, sorted by date ascending.

#### Request:
- **Headers**: `Accept: application/json`
- **Query Params**: None

#### Response (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "Tech Fest 2026",
    "description": "Annual technical symposium with coding challenges and hackathons.",
    "date": "2026-10-15",
    "time": "10:00 AM",
    "venue": "Auditorium Hall A",
    "capacity": 100,
    "registeredCount": 28,
    "category": "Technical",
    "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60"
  },
  {
    "id": 2,
    "name": "AI & Cloud Summit",
    "description": "Keynotes on generative AI, agentic systems, and cloud infrastructure.",
    "date": "2026-10-20",
    "time": "02:00 PM",
    "venue": "Seminar Room 302",
    "capacity": 80,
    "registeredCount": 80,
    "category": "Technical",
    "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60"
  }
]
```

---

### 1.2 `GET /api/events/<id>`
Retrieve details for a single event by ID.

#### Request:
- **URL Param**: `id` (integer)

#### Response (`200 OK`):
```json
{
  "id": 1,
  "name": "Tech Fest 2026",
  "description": "Annual technical symposium with coding challenges and hackathons.",
  "date": "2026-10-15",
  "time": "10:00 AM",
  "venue": "Auditorium Hall A",
  "capacity": 100,
  "registeredCount": 28,
  "category": "Technical",
  "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60"
}
```

#### Error Response (`404 Not Found`):
```json
{
  "error": "NOT_FOUND",
  "message": "Event not found"
}
```

---

### 1.3 `POST /api/events`
Create a new event. Supports both JSON body and `multipart/form-data` (with image file upload).

#### Request:
- **Headers**: `Content-Type: application/json` or `multipart/form-data`
- **Body Schema (JSON)**:
```json
{
  "name": "Web Dev Workshop",
  "description": "Hands-on workshop covering React 19, TypeScript, and modern styling.",
  "date": "2026-11-05",
  "time": "11:00 AM",
  "venue": "Lab 4, Computer Science Block",
  "capacity": 50,
  "category": "Workshop",
  "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60"
}
```

#### Response (`201 Created`):
```json
{
  "id": 3,
  "name": "Web Dev Workshop",
  "description": "Hands-on workshop covering React 19, TypeScript, and modern styling.",
  "date": "2026-11-05",
  "time": "11:00 AM",
  "venue": "Lab 4, Computer Science Block",
  "capacity": 50,
  "registeredCount": 0,
  "category": "Workshop",
  "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60"
}
```

#### Error Response (`400 Bad Request`):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Name, date, time, venue, and valid capacity are required."
}
```

---

### 1.4 `DELETE /api/events/<id>`
Delete an event and its associated registrations.

#### Request:
- **URL Param**: `id` (integer)

#### Response (`200 OK` or `204 No Content`):
```json
{
  "success": true,
  "message": "Event deleted successfully."
}
```

#### Error Response (`404 Not Found`):
```json
{
  "error": "NOT_FOUND",
  "message": "Event not found"
}
```

---

## 2. Registrations Endpoints

### 2.1 `POST /api/registrations`
Register a student for an event. Triggers validation for event capacity, duplicate email per event, and dispatches confirmation email.

#### Request:
- **Headers**: `Content-Type: application/json`
- **Body Schema**:
```json
{
  "eventId": 1,
  "name": "Jane Doe",
  "email": "jane.doe@college.edu",
  "studentId": "STU2026042"
}
```

#### Response (`201 Created`):
```json
{
  "id": 105,
  "eventId": 1,
  "name": "Jane Doe",
  "email": "jane.doe@college.edu",
  "studentId": "STU2026042",
  "registeredAt": "2026-09-30T14:30:00Z"
}
```

#### Error Responses:
- **Duplicate Registration (`409 Conflict`)**:
```json
{
  "error": "DUPLICATE_REGISTRATION",
  "message": "This email is already registered for this event."
}
```

- **Event Full (`409 Conflict`)**:
```json
{
  "error": "EVENT_FULL",
  "message": "This event has reached full capacity."
}
```

- **Invalid Data (`400 Bad Request`)**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Full name, valid email, and student ID are required."
}
```

---

### 2.2 `GET /api/registrations`
List student registrations.

#### Request:
- **Query Params**:
  - `eventId` (optional integer): Filter registrations by event.

#### Response (`200 OK`):
```json
[
  {
    "id": 1,
    "eventId": 1,
    "name": "Soham Palkar",
    "email": "soham@gmail.com",
    "studentId": "2023CS001",
    "registeredAt": "2026-09-20T10:15:00Z"
  },
  {
    "id": 2,
    "eventId": 1,
    "name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "studentId": "STU2026042",
    "registeredAt": "2026-09-30T14:30:00Z"
  }
]
```

---

## 3. Admin Authentication Endpoint

### 3.1 `POST /api/admin/login`
Authenticate admin credentials against configured administrative credentials.

#### Request:
- **Headers**: `Content-Type: application/json`
- **Body Schema**:
```json
{
  "adminId": "ADMIN001",
  "password": "EventHub@2026"
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "adminId": "ADMIN001",
  "token": "admin-session-token-example"
}
```

#### Error Response (`401 Unauthorized`):
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid Admin ID or Password."
}
```
