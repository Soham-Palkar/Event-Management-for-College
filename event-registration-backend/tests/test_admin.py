def test_admin_login_success(client):
    """Test POST /api/admin/login with correct credentials."""
    payload = {
        'adminId': 'ADMIN001',
        'password': 'EventHub@2026'
    }
    response = client.post('/api/admin/login', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['adminId'] == 'ADMIN001'
    assert 'token' in data


def test_admin_login_invalid_password(client):
    """Test POST /api/admin/login with incorrect password."""
    payload = {
        'adminId': 'ADMIN001',
        'password': 'WrongPassword123'
    }
    response = client.post('/api/admin/login', json=payload)
    assert response.status_code == 401
    data = response.get_json()
    assert data['code'] == 'UNAUTHORIZED'


def test_admin_login_invalid_id(client):
    """Test POST /api/admin/login with incorrect admin ID."""
    payload = {
        'adminId': 'UNKNOWN_ADMIN',
        'password': 'EventHub@2026'
    }
    response = client.post('/api/admin/login', json=payload)
    assert response.status_code == 401
    data = response.get_json()
    assert data['code'] == 'UNAUTHORIZED'


def test_admin_login_missing_fields(client):
    """Test POST /api/admin/login with missing fields."""
    response = client.post('/api/admin/login', json={})
    assert response.status_code == 401
    assert response.get_json()['code'] == 'UNAUTHORIZED'


def test_health_check_endpoint(client):
    """Test GET /api/health returns 200 and healthy status."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'eventhub-api'
