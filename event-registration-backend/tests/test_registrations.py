from unittest.mock import patch
from app.database import get_db


def test_registration_success(client, sample_event):
    """Test successful student registration returning 201."""
    payload = {
        'eventId': sample_event['id'],
        'name': 'Alice Smith',
        'email': 'alice@college.edu',
        'studentId': 'CS202601'
    }
    response = client.post('/api/registrations', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['id'] is not None
    assert data['eventId'] == sample_event['id']
    assert data['name'] == 'Alice Smith'
    assert data['email'] == 'alice@college.edu'
    assert data['studentId'] == 'CS202601'
    assert data['registeredAt'] is not None


def test_registration_succeeds_when_email_fails(client, sample_event):
    """
    Test that registration is NOT rolled back if email delivery encounters an error.
    The student registration must still be saved and return 201 Created.
    """
    with patch('app.routes.registrations.send_registration_confirmation') as mock_email:
        # Simulate SMTP exception
        mock_email.side_effect = Exception("SMTP Connection Refused")
        
        payload = {
            'eventId': sample_event['id'],
            'name': 'Email Fail Test',
            'email': 'emailfail@college.edu',
            'studentId': 'EF001'
        }
        response = client.post('/api/registrations', json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert data['email'] == 'emailfail@college.edu'


def test_registration_calls_email_service_with_correct_data(client, sample_event):
    """Test that email_service is called with the exact registration and event details."""
    with patch('app.routes.registrations.send_registration_confirmation') as mock_email:
        mock_email.return_value = True

        payload = {
            'eventId': sample_event['id'],
            'name': 'Bob Tester',
            'email': 'bob.tester@college.edu',
            'studentId': 'BT2026'
        }
        response = client.post('/api/registrations', json=payload)
        assert response.status_code == 201
        
        mock_email.assert_called_once()
        called_reg, called_event = mock_email.call_args[0]
        
        assert called_reg['email'] == 'bob.tester@college.edu'
        assert called_reg['name'] == 'Bob Tester'
        assert called_reg['student_id'] == 'BT2026'
        assert called_event['event_name'] == 'Hackathon 2026'
        assert called_event['venue'] == 'Computer Science Lab 1'


def test_duplicate_registration_prevented(client, sample_event):
    """
    Test CORE BUSINESS RULE: A student cannot register twice for the same event with the same email.
    Must return 409 Conflict with DUPLICATE_REGISTRATION error code.
    """
    payload = {
        'eventId': sample_event['id'],
        'name': 'Alice Smith',
        'email': 'alice@college.edu',
        'studentId': 'CS202601'
    }
    # First registration -> 201
    res1 = client.post('/api/registrations', json=payload)
    assert res1.status_code == 201

    # Second registration with same email & same event -> 409
    res2 = client.post('/api/registrations', json=payload)
    assert res2.status_code == 409
    data = res2.get_json()
    assert data['code'] == 'DUPLICATE_REGISTRATION'
    assert 'already registered' in data['message'].lower()


def test_same_email_different_events_allowed(client, app, sample_event):
    """Test that a student CAN register for different events using the same email."""
    # Create second event
    with app.app_context():
        db = get_db()
        cur = db.execute(
            """
            INSERT INTO events (event_name, description, date, time, venue, capacity, category)
            VALUES ('Design Workshop', 'UI/UX basics.', '2026-11-15', '02:00 PM', 'Lab 2', 50, 'Workshop')
            """
        )
        db.commit()
        second_event_id = cur.lastrowid

    student_email = 'multievent@college.edu'

    # Register for event 1
    res1 = client.post('/api/registrations', json={
        'eventId': sample_event['id'],
        'name': 'Bob Multi',
        'email': student_email,
        'studentId': 'CS202602'
    })
    assert res1.status_code == 201

    # Register for event 2 with same email -> Should succeed
    res2 = client.post('/api/registrations', json={
        'eventId': second_event_id,
        'name': 'Bob Multi',
        'email': student_email,
        'studentId': 'CS202602'
    })
    assert res2.status_code == 201


def test_event_capacity_limit_enforced(client, sample_event):
    """
    Test capacity limit enforcement.
    sample_event has capacity: 2.
    Third registration must return 409 Conflict with EVENT_FULL.
    """
    event_id = sample_event['id']

    # 1st seat
    res1 = client.post('/api/registrations', json={
        'eventId': event_id,
        'name': 'Student One',
        'email': 's1@college.edu',
        'studentId': 'STU01'
    })
    assert res1.status_code == 201

    # 2nd seat
    res2 = client.post('/api/registrations', json={
        'eventId': event_id,
        'name': 'Student Two',
        'email': 's2@college.edu',
        'studentId': 'STU02'
    })
    assert res2.status_code == 201

    # 3rd seat (exceeds capacity of 2) -> 409
    res3 = client.post('/api/registrations', json={
        'eventId': event_id,
        'name': 'Student Three',
        'email': 's3@college.edu',
        'studentId': 'STU03'
    })
    assert res3.status_code == 409
    data = res3.get_json()
    assert data['code'] == 'EVENT_FULL'


def test_registration_validation_and_not_found(client):
    """Test validation errors for missing fields, invalid email, and non-existent event."""
    # Missing fields
    res1 = client.post('/api/registrations', json={'eventId': 1, 'email': 'test@example.com'})
    assert res1.status_code == 400
    assert res1.get_json()['code'] == 'VALIDATION_ERROR'

    # Invalid email
    res2 = client.post('/api/registrations', json={
        'eventId': 1,
        'name': 'John',
        'email': 'invalid-email-string',
        'studentId': 'STU01'
    })
    assert res2.status_code == 400
    assert res2.get_json()['code'] == 'VALIDATION_ERROR'

    # Non-existent event
    res3 = client.post('/api/registrations', json={
        'eventId': 99999,
        'name': 'John',
        'email': 'valid@example.com',
        'studentId': 'STU01'
    })
    assert res3.status_code == 404
    assert res3.get_json()['code'] == 'NOT_FOUND'


def test_list_and_filter_registrations(client, sample_event):
    """Test GET /api/registrations and filtering with ?eventId=."""
    # Create registration
    client.post('/api/registrations', json={
        'eventId': sample_event['id'],
        'name': 'Filter Test',
        'email': 'filter@college.edu',
        'studentId': 'FT01'
    })

    # List all
    res = client.get('/api/registrations')
    assert res.status_code == 200
    data = res.get_json()
    assert len(data) >= 1

    # Filter matching
    res_filtered = client.get(f"/api/registrations?eventId={sample_event['id']}")
    assert res_filtered.status_code == 200
    assert len(res_filtered.get_json()) == 1

    # Filter non-matching
    res_empty = client.get('/api/registrations?eventId=99999')
    assert res_empty.status_code == 200
    assert len(res_empty.get_json()) == 0
