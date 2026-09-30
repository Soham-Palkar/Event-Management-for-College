import io
from pathlib import Path
from app.database import get_db


def test_list_events_empty(client):
    """Test GET /api/events when database has no events."""
    response = client.get('/api/events')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_list_events_populated(client, sample_event):
    """Test GET /api/events returns formatted event list with registeredCount."""
    response = client.get('/api/events')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]['id'] == sample_event['id']
    assert data[0]['name'] == 'Hackathon 2026'
    assert data[0]['registeredCount'] == 0
    assert data[0]['capacity'] == 2


def test_get_event_by_id_success(client, sample_event):
    """Test GET /api/events/<id> for existing event."""
    response = client.get(f"/api/events/{sample_event['id']}")
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == sample_event['id']
    assert data['name'] == 'Hackathon 2026'
    assert data['category'] == 'Technical'


def test_get_event_by_id_not_found(client):
    """Test GET /api/events/<id> returns 404 for non-existent event."""
    response = client.get('/api/events/99999')
    assert response.status_code == 404
    data = response.get_json()
    assert data['code'] == 'NOT_FOUND'


def test_create_event_json_external_url(client):
    """Test POST /api/events with valid JSON payload and external image URL."""
    payload = {
        'name': 'Robotics Exhibition',
        'description': 'Showcase of autonomous robotics and drone systems.',
        'date': '2026-11-25',
        'time': '11:30 AM',
        'venue': 'Engineering Quad',
        'capacity': 120,
        'category': 'Technical',
        'image': 'https://images.unsplash.com/photo-example.jpg'
    }
    response = client.post('/api/events', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['id'] is not None
    assert data['name'] == 'Robotics Exhibition'
    assert data['image'] == 'https://images.unsplash.com/photo-example.jpg'
    assert data['capacity'] == 120
    assert data['registeredCount'] == 0


def test_create_event_formdata_external_url(client):
    """Test POST /api/events with FormData and external image URL string."""
    data = {
        'name': 'Cloud Computing Seminar',
        'description': 'Serverless and microservices architectures.',
        'date': '2026-11-28',
        'time': '03:00 PM',
        'venue': 'Seminar Hall B',
        'capacity': '60',
        'category': 'Seminar',
        'image': 'https://example.com/cloud.png'
    }
    response = client.post('/api/events', data=data)
    assert response.status_code == 201
    res_data = response.get_json()
    assert res_data['name'] == 'Cloud Computing Seminar'
    assert res_data['image'] == 'https://example.com/cloud.png'


def test_create_event_multipart_with_image_upload_and_static_serving(client, app):
    """
    Test POST /api/events with multipart/form-data and uploaded image file.
    Verifies:
    1. Returns 201 with relative web path /uploads/events/<filename>.
    2. Physical file exists on disk.
    3. GET /uploads/events/<filename> returns 200 with matching file bytes.
    """
    fake_png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4'
    data = {
        'name': 'Music Night',
        'description': 'Live acoustic performances.',
        'date': '2026-12-01',
        'time': '06:00 PM',
        'venue': 'Auditorium',
        'capacity': '150',
        'category': 'Cultural',
        'image': (io.BytesIO(fake_png_data), 'poster.png')
    }
    response = client.post('/api/events', data=data, content_type='multipart/form-data')
    assert response.status_code == 201
    res_data = response.get_json()
    assert res_data['name'] == 'Music Night'
    
    relative_img_path = res_data['image']
    assert relative_img_path.startswith('/uploads/events/')
    filename = relative_img_path.replace('/uploads/events/', '')

    # Verify physical file existence in UPLOAD_FOLDER
    upload_folder = Path(app.config['UPLOAD_FOLDER']).resolve()
    physical_file = upload_folder / filename
    assert physical_file.is_file()

    # Verify static file serving via GET /uploads/events/<filename>
    static_res = client.get(f"/uploads/events/{filename}")
    assert static_res.status_code == 200
    assert static_res.data == fake_png_data


def test_create_event_validation_errors(client):
    """Test POST /api/events with missing required fields and negative capacity."""
    # Missing name
    response = client.post('/api/events', json={
        'description': 'Sample',
        'date': '2026-10-10',
        'time': '10:00 AM',
        'venue': 'Hall',
        'capacity': 50
    })
    assert response.status_code == 400
    assert response.get_json()['code'] == 'VALIDATION_ERROR'

    # Invalid negative capacity
    response = client.post('/api/events', json={
        'name': 'Sample Event',
        'description': 'Sample',
        'date': '2026-10-10',
        'time': '10:00 AM',
        'venue': 'Hall',
        'capacity': -5
    })
    assert response.status_code == 400
    assert response.get_json()['code'] == 'VALIDATION_ERROR'


def test_delete_event_cleans_up_physical_image(client, app):
    """Test DELETE /api/events/<id> cleans up the physical uploaded image from disk."""
    fake_png_data = b'sample-delete-image-content'
    data = {
        'name': 'Cleanup Event',
        'description': 'Event for testing image cleanup.',
        'date': '2026-12-10',
        'time': '10:00 AM',
        'venue': 'Room 5',
        'capacity': '20',
        'category': 'General',
        'image': (io.BytesIO(fake_png_data), 'cleanup_poster.png')
    }
    create_res = client.post('/api/events', data=data, content_type='multipart/form-data')
    assert create_res.status_code == 201
    event_id = create_res.get_json()['id']
    img_path = create_res.get_json()['image']
    filename = img_path.replace('/uploads/events/', '')

    upload_folder = Path(app.config['UPLOAD_FOLDER']).resolve()
    physical_file = upload_folder / filename
    assert physical_file.is_file()

    # Delete event
    del_res = client.delete(f"/api/events/{event_id}")
    assert del_res.status_code == 200
    assert del_res.get_json()['success'] is True

    # Verify physical file is cleaned up
    assert not physical_file.exists()


def test_delete_event_not_found(client):
    """Test DELETE /api/events/<id> returns 404 when ID does not exist."""
    response = client.delete('/api/events/88888')
    assert response.status_code == 404
    assert response.get_json()['code'] == 'NOT_FOUND'
