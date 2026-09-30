import os
import uuid
from pathlib import Path
from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename
from app.database import get_db

events_bp = Blueprint('events', __name__, url_prefix='/api/events')


def allowed_file(filename):
    """Check if the uploaded file has an allowed image extension."""
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def format_event(row):
    """Format an event database row to the standard API response dictionary."""
    return {
        'id': row['id'],
        'name': row['event_name'],
        'description': row['description'],
        'date': row['date'],
        'time': row['time'],
        'venue': row['venue'],
        'capacity': row['capacity'],
        'registeredCount': row['registered_count'] if 'registered_count' in row.keys() else 0,
        'category': row['category'],
        'image': row['image'] if row['image'] else None,
    }


@events_bp.route('', methods=['GET'])
def list_events():
    """Retrieve all events sorted by date ascending."""
    db = get_db()
    query = """
        SELECT e.*, COUNT(r.id) AS registered_count
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        GROUP BY e.id
        ORDER BY e.date ASC, e.time ASC
    """
    rows = db.execute(query).fetchall()
    return jsonify([format_event(row) for row in rows]), 200


@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Retrieve details for a single event."""
    db = get_db()
    query = """
        SELECT e.*, COUNT(r.id) AS registered_count
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        WHERE e.id = ?
        GROUP BY e.id
    """
    row = db.execute(query, (event_id,)).fetchone()
    if not row:
        return jsonify({
            'code': 'NOT_FOUND',
            'error': 'NOT_FOUND',
            'message': 'Event not found.'
        }), 404

    return jsonify(format_event(row)), 200


@events_bp.route('', methods=['POST'])
def create_event():
    """Create a new event from JSON payload or multipart/form-data with image upload."""
    db = get_db()
    
    # Check content type
    if request.is_json:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', 'Technical').strip()
        date = data.get('date', '').strip()
        time = data.get('time', '').strip()
        venue = data.get('venue', '').strip()
        capacity_val = data.get('capacity')
        image = data.get('image', '').strip() or None
    else:
        # Form Data (multipart or urlencoded)
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        category = request.form.get('category', 'Technical').strip()
        date = request.form.get('date', '').strip()
        time = request.form.get('time', '').strip()
        venue = request.form.get('venue', '').strip()
        capacity_val = request.form.get('capacity')
        image = request.form.get('image', '').strip() or None

        # Handle File Upload if provided
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                upload_folder = Path(current_app.config['UPLOAD_FOLDER']).resolve()
                upload_folder.mkdir(parents=True, exist_ok=True)
                
                unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                file_path = upload_folder / unique_filename
                
                print(f"[UPLOAD] Directory: {upload_folder}")
                print(f"[UPLOAD] Filename: {unique_filename}")
                print(f"[UPLOAD] Saving to: {file_path}")
                
                file.save(str(file_path))
                
                file_exists = file_path.is_file()
                print(f"[UPLOAD] File exists after save: {file_exists}")
                
                # Store standard relative web URL in SQLite
                image = f"/uploads/events/{unique_filename}"

    # Validation
    if not name or not description or not date or not time or not venue:
        return jsonify({
            'code': 'VALIDATION_ERROR',
            'error': 'VALIDATION_ERROR',
            'message': 'Name, description, date, time, and venue are required.'
        }), 400

    try:
        capacity = int(capacity_val)
        if capacity < 1:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({
            'code': 'VALIDATION_ERROR',
            'error': 'VALIDATION_ERROR',
            'message': 'Capacity must be a positive number.'
        }), 400

    cursor = db.execute(
        """
        INSERT INTO events (event_name, description, date, time, venue, capacity, category, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (name, description, date, time, venue, capacity, category, image)
    )
    db.commit()
    new_id = cursor.lastrowid

    # Retrieve inserted row
    new_row = db.execute(
        "SELECT e.*, 0 AS registered_count FROM events e WHERE e.id = ?",
        (new_id,)
    ).fetchone()

    return jsonify(format_event(new_row)), 201


@events_bp.route('/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event by ID (cascades all registrations and cleans up uploaded image)."""
    db = get_db()
    existing = db.execute("SELECT id, image FROM events WHERE id = ?", (event_id,)).fetchone()
    if not existing:
        return jsonify({
            'code': 'NOT_FOUND',
            'error': 'NOT_FOUND',
            'message': 'Event not found.'
        }), 404

    # If the event had an uploaded image, clean up physical file from uploads folder
    image_val = existing['image']
    if image_val and image_val.startswith('/uploads/events/'):
        filename = image_val.replace('/uploads/events/', '', 1)
        upload_folder = Path(current_app.config['UPLOAD_FOLDER']).resolve()
        file_path = upload_folder / filename
        if file_path.is_file():
            try:
                file_path.unlink()
                print(f"[DELETE] Removed uploaded image file: {file_path}")
            except Exception as e:
                print(f"[DELETE] Warning: Failed to remove physical file {file_path}: {e}")

    db.execute("DELETE FROM events WHERE id = ?", (event_id,))
    db.commit()

    return jsonify({
        'success': True,
        'message': 'Event deleted successfully.'
    }), 200
