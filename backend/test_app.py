import pytest
import json
import tempfile
import os
from app import app, init_db

@pytest.fixture
def client():
    """Create test client with temporary database"""
    db_fd, db_path = tempfile.mkstemp()
    app.config['DATABASE'] = db_path
    app.config['TESTING'] = True
    
    init_db()
    
    with app.test_client() as client:
        yield client
    
    os.close(db_fd)
    os.unlink(db_path)

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_login_success(client):
    """Test successful login"""
    response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wayne123',
        'role': 'admin'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data
    assert data['username'] == 'batman'
    assert data['role'] == 'admin'

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wrongpassword',
        'role': 'admin'
    })
    assert response.status_code == 401

def test_inventory_requires_auth(client):
    """Test that inventory endpoint requires JWT"""
    response = client.get('/api/inventory')
    assert response.status_code == 401

def test_get_inventory(client):
    """Test fetching inventory with valid token"""
    # Login first
    login_response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wayne123',
        'role': 'admin'
    })
    token = json.loads(login_response.data)['token']
    
    # Fetch inventory
    response = client.get(
        '/api/inventory',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) > 0  # Should have seed data

def test_get_allies(client):
    """Test fetching allies with valid token"""
    # Login first
    login_response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wayne123',
        'role': 'admin'
    })
    token = json.loads(login_response.data)['token']
    
    # Fetch allies
    response = client.get(
        '/api/allies',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    # May vary depending on API availability

def test_create_inventory_item(client):
    """Test creating inventory item"""
    # Login first
    login_response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wayne123',
        'role': 'admin'
    })
    token = json.loads(login_response.data)['token']
    
    # Create item
    response = client.post(
        '/api/inventory',
        json={
            'name': 'Test Equipment',
            'category': 'Equipment',
            'quantity': 5,
            'description': 'Test description',
            'icon': '🧪'
        },
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'id' in data

def test_verify_token(client):
    """Test token verification"""
    # Login first
    login_response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wayne123',
        'role': 'admin'
    })
    token = json.loads(login_response.data)['token']
    
    # Verify token
    response = client.get(
        '/api/auth/verify',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['valid'] == True
    assert data['user']['username'] == 'batman'
