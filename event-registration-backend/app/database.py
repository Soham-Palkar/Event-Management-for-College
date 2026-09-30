import sqlite3
from pathlib import Path
from flask import current_app, g


def get_db():
    """Get or open a SQLite database connection for the current request context."""
    if 'db' not in g:
        db_path = current_app.config['DATABASE_PATH']
        
        # Ensure parent directory exists if using file-based DB
        if db_path != ':memory:':
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
            
        g.db = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
        )
        g.db.row_factory = sqlite3.Row
        # Enable foreign key enforcement
        g.db.execute("PRAGMA foreign_keys = ON;")
        
    return g.db


def close_db(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    """Initialize database tables using the schema script."""
    schema_path = Path(__file__).resolve().parent.parent / 'database' / 'schema.sql'
    
    with app.app_context():
        db = get_db()
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
