import re
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from app.database import get_db
from app.services.email_service import send_registration_confirmation

registrations_bp = Blueprint('registrations', __name__, url_prefix='/api/registrations')

EMAIL_REGEX = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def format_registration(row):
    """Format a registration database row to the standard API response dictionary."""
    return {
        'id': row['id'],
        'eventId': row['event_id'],
        'name': row['name'],
        'email': row['email'],
        'studentId': row['student_id'],
        'registeredAt': row['registered_at'],
    }


@registrations_bp.route('', methods=['GET'])
def list_registrations():
    """Retrieve all student registrations, optionally filtered by eventId."""
    db = get_db()
    event_id = request.args.get('eventId') or request.args.get('event_id')

    if event_id:
        try:
            eid = int(event_id)
            rows = db.execute(
                "SELECT * FROM registrations WHERE event_id = ? ORDER BY registered_at DESC, id DESC",
                (eid,)
            ).fetchall()
        except ValueError:
            return jsonify([]), 200
    else:
        rows = db.execute(
            "SELECT * FROM registrations ORDER BY registered_at DESC, id DESC"
        ).fetchall()

    return jsonify([format_registration(row) for row in rows]), 200


@registrations_bp.route('', methods=['POST'])
def register_student():
    """Register a student for an event with duplicate check, capacity check, and email dispatch."""
    db = get_db()
    data = request.get_json() or {}

    event_id_val = data.get('eventId') if data.get('eventId') is not None else data.get('event_id')
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    student_id = str(data.get('studentId') if data.get('studentId') is not None else data.get('student_id', '')).strip()

    # Field presence validation
    if not event_id_val or not name or not email or not student_id:
        return jsonify({
            'code': 'VALIDATION_ERROR',
            'error': 'VALIDATION_ERROR',
            'message': 'Event ID, full name, valid email, and student ID are required.'
        }), 400

    try:
        event_id = int(event_id_val)
    except (ValueError, TypeError):
        return jsonify({
            'code': 'VALIDATION_ERROR',
            'error': 'VALIDATION_ERROR',
            'message': 'Invalid event ID.'
        }), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({
            'code': 'VALIDATION_ERROR',
            'error': 'VALIDATION_ERROR',
            'message': 'Please enter a valid email address.'
        }), 400

    # Verify event exists
    event = db.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    if not event:
        return jsonify({
            'code': 'NOT_FOUND',
            'error': 'NOT_FOUND',
            'message': 'Event not found.'
        }), 404

    # Verify event capacity
    current_count_row = db.execute(
        "SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?",
        (event_id,)
    ).fetchone()
    current_count = current_count_row['count'] if current_count_row else 0

    if current_count >= event['capacity']:
        return jsonify({
            'code': 'EVENT_FULL',
            'error': 'EVENT_FULL',
            'message': 'This event is full. No seats available.'
        }), 409

    # Verify duplicate registration (Core Business Rule)
    duplicate = db.execute(
        "SELECT id FROM registrations WHERE event_id = ? AND LOWER(email) = ?",
        (event_id, email)
    ).fetchone()

    if duplicate:
        return jsonify({
            'code': 'DUPLICATE_REGISTRATION',
            'error': 'DUPLICATE_REGISTRATION',
            'message': 'You are already registered for this event.'
        }), 409

    # Record registration timestamp
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor = db.execute(
        """
        INSERT INTO registrations (event_id, name, email, student_id, registered_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (event_id, name, email, student_id, now_iso)
    )
    db.commit()
    new_reg_id = cursor.lastrowid

    new_reg_row = db.execute(
        "SELECT * FROM registrations WHERE id = ?",
        (new_reg_id,)
    ).fetchone()

    # Dispatch confirmation email via SMTP (safe execution: errors are logged but don't abort registration)
    try:
        send_registration_confirmation(dict(new_reg_row), dict(event))
    except Exception as exc:
        print(f"[EMAIL] Unexpected error during confirmation email dispatch: {exc}")

    return jsonify(format_registration(new_reg_row)), 201
