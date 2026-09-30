# Database Schema: SQLite Specification

This document details the SQLite database schema, table definitions, column types, relational constraints, indices, and DDL migration scripts for the **EventHub** application.

---

## 1. Entity-Relationship Diagram

```text
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│                EVENTS                │       │            REGISTRATIONS             │
├──────────────────────────────────────┤       ├──────────────────────────────────────┤
│ PK  id               INTEGER         │◄──┐   │ PK  id               INTEGER         │
│     event_name       TEXT NOT NULL   │   │   │ FK  event_id         INTEGER NOT NULL│───┘
│     description      TEXT NOT NULL   │   └───┤     name             TEXT NOT NULL   │
│     date             TEXT NOT NULL   │       │     email            TEXT NOT NULL   │
│     time             TEXT NOT NULL   │       │     student_id       TEXT NOT NULL   │
│     venue            TEXT NOT NULL   │       │     registered_at    TEXT NOT NULL   │
│     capacity         INTEGER NOT NULL│       ├──────────────────────────────────────┤
│     category         TEXT NOT NULL   │       │ UNIQUE (event_id, email)             │
│     image            TEXT            │       └──────────────────────────────────────┘
│     created_at       TEXT NOT NULL   │
└──────────────────────────────────────┘
```

---

## 2. Table Specifications

### 2.1 `events` Table
Stores college event postings.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | Auto-increment | Primary Key |
| `event_name` | `TEXT` | `NO` | - | Title/Name of the event |
| `description` | `TEXT` | `NO` | - | Detailed description |
| `date` | `TEXT` | `NO` | - | Date string in ISO format (`YYYY-MM-DD`) |
| `time` | `TEXT` | `NO` | - | Time string (e.g. `10:00 AM` or `14:00`) |
| `venue` | `TEXT` | `NO` | - | Location / Hall / Auditorium / Lab |
| `capacity` | `INTEGER` | `NO` | - | Maximum permitted attendees (must be > 0) |
| `category` | `TEXT` | `NO` | `'Technical'` | Category (`Technical`, `Cultural`, `Sports`, `Workshop`, `Seminar`, `General`) |
| `image` | `TEXT` | `YES` | `NULL` | Static image URL or uploaded file path |
| `created_at` | `TEXT` | `NO` | `CURRENT_TIMESTAMP`| Record creation timestamp |

---

### 2.2 `registrations` Table
Stores student event registrations.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `NO` | Auto-increment | Primary Key |
| `event_id` | `INTEGER` | `NO` | - | Foreign Key referencing `events(id)` |
| `name` | `TEXT` | `NO` | - | Full name of the student |
| `email` | `TEXT` | `NO` | - | Valid student email address |
| `student_id` | `TEXT` | `NO` | - | College Student Registration ID |
| `registered_at`| `TEXT` | `NO` | `CURRENT_TIMESTAMP`| Timestamp when registration was confirmed |

---

## 3. Database Constraints & Business Rules

1. **Foreign Key Integrity**:
   - `FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE`
   - If an admin deletes an event, all related registration records are automatically pruned.
   - Note: SQLite foreign keys must be enabled via `PRAGMA foreign_keys = ON;`.

2. **Core Uniqueness Rule**:
   - `UNIQUE(event_id, email)`
   - Prevents a student from submitting multiple registrations for the exact same event.
   - A student can still register for different events using the same email.

3. **Capacity Check (Application / Trigger Layer)**:
   - Before inserting a row into `registrations`, the application or database checks:
     `SELECT COUNT(*) FROM registrations WHERE event_id = ?` < `capacity`.

---

## 4. SQL DDL (Schema Creation Script)

```sql
-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Create EVENTS Table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK(capacity > 0),
    category TEXT NOT NULL DEFAULT 'Technical',
    image TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create REGISTRATIONS Table
CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_id TEXT NOT NULL,
    registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(event_id, email)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
```

---

## 5. Seed Data (Initial Mock Dataset)

```sql
INSERT INTO events (id, event_name, description, date, time, venue, capacity, category, image) VALUES
(1, 'Tech Fest 2026', 'Annual technical symposium featuring hackathons, coding contests, and guest lectures from industry leaders.', '2026-10-15', '10:00 AM', 'Auditorium Hall A', 100, 'Technical', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'),
(2, 'AI & Cloud Summit', 'Explore cutting-edge developments in machine learning, cloud architectures, and modern DevOps pipelines.', '2026-10-20', '02:00 PM', 'Seminar Room 302', 80, 'Technical', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60'),
(3, 'Cultural Night 2026', 'An evening celebrating music, dance, theatre, and artistic performances by student clubs.', '2026-10-28', '06:00 PM', 'Open Air Amphitheater', 200, 'Cultural', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60');

INSERT INTO registrations (event_id, name, email, student_id, registered_at) VALUES
(1, 'Soham Palkar', 'soham@gmail.com', '2023CS001', '2026-09-20T10:15:00Z'),
(1, 'Alex Johnson', 'alex.j@example.com', '2023CS014', '2026-09-21T11:00:00Z');
```
