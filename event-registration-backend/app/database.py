import os
import re
import sqlite3
from pathlib import Path
from flask import current_app, g

try:
    import psycopg
    from psycopg.rows import dict_row
    PSYCOPG_AVAILABLE = True
except ImportError:
    PSYCOPG_AVAILABLE = False
    dict_row = None


class PostgresCursorWrapper:
    """Wrapper around psycopg cursor providing SQLite-compatible cursor attributes."""
    def __init__(self, cursor, lastrowid=None, returned_row=None):
        self._cursor = cursor
        self.lastrowid = lastrowid
        self._returned_row = returned_row

    @property
    def rowcount(self):
        return getattr(self._cursor, 'rowcount', 0)

    @property
    def description(self):
        return getattr(self._cursor, 'description', None)

    def fetchone(self):
        if self._returned_row is not None:
            row = self._returned_row
            self._returned_row = None
            return row
        return self._cursor.fetchone()

    def fetchall(self):
        if self._returned_row is not None:
            row = self._returned_row
            self._returned_row = None
            remaining = self._cursor.fetchall()
            return [row] + list(remaining)
        return self._cursor.fetchall()

    def fetchmany(self, size=None):
        if self._returned_row is not None:
            row = self._returned_row
            self._returned_row = None
            remaining = self._cursor.fetchmany(size - 1) if size is not None else self._cursor.fetchmany()
            return [row] + list(remaining)
        return self._cursor.fetchmany(size) if size is not None else self._cursor.fetchmany()

    def __iter__(self):
        if self._returned_row is not None:
            yield self._returned_row
            self._returned_row = None
        yield from self._cursor

    def close(self):
        self._cursor.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class PostgresConnectionWrapper:
    """Wrapper around psycopg connection to provide a familiar SQLite-like API."""
    def __init__(self, conn):
        self._conn = conn

    @staticmethod
    def _convert_sql(sql: str) -> str:
        """Convert ? parameter placeholders to %s while preserving ? inside string literals."""
        token_pattern = re.compile(r"('(?:''|[^'])*')|(\?)")
        return token_pattern.sub(lambda m: m.group(1) if m.group(1) else "%s", sql)

    def execute(self, sql: str, params=None):
        converted_sql = self._convert_sql(sql)
        cursor = self._conn.cursor(row_factory=dict_row) if dict_row else self._conn.cursor()

        stripped = converted_sql.strip()
        is_insert = stripped.upper().startswith("INSERT INTO ")
        has_returning = " RETURNING " in stripped.upper()

        if is_insert and not has_returning:
            query_with_returning = f"{stripped.rstrip(';')} RETURNING id;"
            try:
                if params is not None:
                    cursor.execute(query_with_returning, params)
                else:
                    cursor.execute(query_with_returning)
                row = cursor.fetchone()
                lastrowid = None
                if row:
                    if isinstance(row, dict) and 'id' in row:
                        lastrowid = row['id']
                    elif isinstance(row, (list, tuple)) and len(row) > 0:
                        lastrowid = row[0]
                return PostgresCursorWrapper(cursor, lastrowid=lastrowid, returned_row=row)
            except Exception:
                self._conn.rollback()
                cursor = self._conn.cursor(row_factory=dict_row) if dict_row else self._conn.cursor()

        if params is not None:
            cursor.execute(converted_sql, params)
        else:
            cursor.execute(converted_sql)
        return PostgresCursorWrapper(cursor)

    def executemany(self, sql: str, seq_of_params):
        converted_sql = self._convert_sql(sql)
        cursor = self._conn.cursor(row_factory=dict_row) if dict_row else self._conn.cursor()
        cursor.executemany(converted_sql, seq_of_params)
        return PostgresCursorWrapper(cursor)

    def executescript(self, script: str):
        cursor = self._conn.cursor()
        cursor.execute(script)
        cursor.close()

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


def is_postgres() -> bool:
    """Check if the current app is configured to use PostgreSQL via DATABASE_URL."""
    db_url = current_app.config.get('DATABASE_URL', '')
    return bool(db_url and db_url.strip())


def get_db():
    """Get or open a database connection for the current request context."""
    if 'db' not in g:
        if is_postgres():
            if not PSYCOPG_AVAILABLE:
                raise RuntimeError(
                    "psycopg is required to connect to PostgreSQL. "
                    "Install it with 'pip install \"psycopg[binary]\"'."
                )
            db_url = current_app.config['DATABASE_URL']
            raw_conn = psycopg.connect(db_url)
            g.db = PostgresConnectionWrapper(raw_conn)
        else:
            db_path = current_app.config['DATABASE_PATH']
            if db_path != ':memory:':
                Path(db_path).parent.mkdir(parents=True, exist_ok=True)
            g.db = sqlite3.connect(
                db_path,
                detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
            )
            g.db.row_factory = sqlite3.Row
            g.db.execute("PRAGMA foreign_keys = ON;")

    return g.db


def close_db(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    """Initialize database tables using the schema script and seed data."""
    with app.app_context():
        db = get_db()
        if is_postgres():
            schema_path = Path(__file__).resolve().parent.parent / 'database' / 'schema_postgres.sql'
            if schema_path.exists():
                with open(schema_path, 'r', encoding='utf-8') as f:
                    db.executescript(f.read())
                db.commit()
        else:
            schema_path = Path(__file__).resolve().parent.parent / 'database' / 'schema.sql'
            if schema_path.exists():
                with open(schema_path, 'r', encoding='utf-8') as f:
                    db.executescript(f.read())
                db.commit()

        # Seed initial sample events if the table is empty (for out-of-the-box demo)
        if not app.config.get('TESTING'):
            seed_initial_data(db)


def seed_initial_data(db):
    """Seed initial sample events if database is empty."""
    cursor = db.execute("SELECT COUNT(*) as count FROM events")
    row = cursor.fetchone()
    if row and row['count'] == 0:
        sample_events = [
            (
                "Tech Fest 2026",
                "Annual technical symposium featuring hackathons, coding contests, and guest lectures from industry leaders.",
                "2026-10-15",
                "10:00 AM",
                "Auditorium Hall A",
                100,
                "Technical",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60"
            ),
            (
                "AI & Cloud Summit",
                "Explore cutting-edge developments in machine learning, cloud architectures, and modern DevOps pipelines.",
                "2026-10-20",
                "02:00 PM",
                "Seminar Room 302",
                80,
                "Technical",
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60"
            ),
            (
                "Cultural Night 2026",
                "An evening celebrating music, dance, theatre, and artistic performances by student clubs.",
                "2026-10-28",
                "06:00 PM",
                "Open Air Amphitheater",
                200,
                "Cultural",
                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60"
            ),
            (
                "Career & Placement Fair",
                "Connect with top technology and engineering recruiters for internships and full-time placement opportunities.",
                "2026-11-02",
                "09:30 AM",
                "Main Campus Grounds",
                150,
                "Seminar",
                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60"
            ),
        ]

        db.executemany(
            """
            INSERT INTO events (event_name, description, date, time, venue, capacity, category, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            sample_events
        )

        # Add sample registration
        db.execute(
            """
            INSERT INTO registrations (event_id, name, email, student_id)
            VALUES (1, 'Soham Palkar', 'soham@gmail.com', '2023CS001')
            """
        )
        db.commit()


def init_app(app):
    """Register database functions with the Flask app."""
    app.teardown_appcontext(close_db)
    init_db(app)
