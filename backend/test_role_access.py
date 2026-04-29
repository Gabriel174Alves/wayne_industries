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

def get_auth_token(client, username, password):
    """Helper to get auth token for user"""
    response = client.post('/api/auth/login', json={
        'username': username,
        'password': password
    })
    return json.loads(response.data)['token']

def test_employee_access_only(client):
    """Test employee can only view, not modify"""
    token = get_auth_token(client, 'oracle', 'oracle123')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Employee CAN view inventory
    response = client.get('/api/inventory', headers=headers)
    assert response.status_code == 200
    
    # Employee CAN view allies
    response = client.get('/api/allies', headers=headers)
    assert response.status_code == 200
    
    # Employee CANNOT create inventory items
    response = client.post('/api/inventory', 
                          json={'name': 'Test Item', 'category': 'Equipment', 'quantity': 5}, 
                          headers=headers)
    assert response.status_code == 403
    assert 'Gerentes ou administradores apenas' in response.get_json()['error']
    
    # Employee CANNOT create allies
    response = client.post('/api/allies', 
                          json={'hero_id': 'test1', 'name': 'Test Ally', 'biography': {'alignment': 'good', 'publisher': 'DC Comics'}}, 
                          headers=headers)
    assert response.status_code == 403
    assert 'Gerentes ou administradores apenas' in response.get_json()['error']
    
    # Employee CANNOT update inventory
    response = client.put('/api/inventory/1', 
                          json={'name': 'Updated Item', 'quantity': 10}, 
                          headers=headers)
    assert response.status_code == 403
    
    # Employee CANNOT delete inventory
    response = client.delete('/api/inventory/1', headers=headers)
    assert response.status_code == 403
    
    # Employee CANNOT delete allies
    response = client.delete('/api/allies/1', headers=headers)
    assert response.status_code == 403

def test_manager_access(client):
    """Test manager can view and edit, but not delete"""
    token = get_auth_token(client, 'robin', 'robin123')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Manager CAN view inventory
    response = client.get('/api/inventory', headers=headers)
    assert response.status_code == 200
    
    # Manager CAN create inventory items
    response = client.post('/api/inventory', 
                          json={'name': 'Manager Item', 'category': 'Equipment', 'quantity': 5}, 
                          headers=headers)
    assert response.status_code == 201
    
    # Manager CAN update inventory
    response = client.put('/api/inventory/1', 
                          json={'name': 'Updated Item', 'quantity': 10}, 
                          headers=headers)
    assert response.status_code == 200
    
    # Manager CAN create allies
    response = client.post('/api/allies', 
                          json={'hero_id': 'test2', 'name': 'Manager Ally', 'biography': {'alignment': 'good', 'publisher': 'DC Comics'}}, 
                          headers=headers)
    assert response.status_code == 201
    
    # Manager CANNOT delete inventory
    response = client.delete('/api/inventory/1', headers=headers)
    assert response.status_code == 403
    assert 'Administradores apenas' in response.get_json()['error']
    
    # Manager CANNOT delete allies
    response = client.delete('/api/allies/1', headers=headers)
    assert response.status_code == 403
    assert 'Administradores apenas' in response.get_json()['error']

def test_admin_full_access(client):
    """Test admin has full access"""
    token = get_auth_token(client, 'batman', 'wayne123')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Admin CAN view inventory
    response = client.get('/api/inventory', headers=headers)
    assert response.status_code == 200
    
    # Admin CAN create inventory items
    response = client.post('/api/inventory', 
                          json={'name': 'Admin Item', 'category': 'Equipment', 'quantity': 5}, 
                          headers=headers)
    assert response.status_code == 201
    
    # Admin CAN update inventory
    response = client.put('/api/inventory/1', 
                          json={'name': 'Admin Updated', 'quantity': 15}, 
                          headers=headers)
    assert response.status_code == 200
    
    # Admin CAN create allies
    response = client.post('/api/allies', 
                          json={'hero_id': 'test3', 'name': 'Admin Ally', 'biography': {'alignment': 'good', 'publisher': 'DC Comics'}}, 
                          headers=headers)
    assert response.status_code == 201
    
    # Admin CAN delete inventory
    response = client.delete('/api/inventory/1', headers=headers)
    assert response.status_code == 200
    
    # Admin CAN delete allies
    response = client.delete('/api/allies/1', headers=headers)
    assert response.status_code == 200

def test_role_hierarchy_enforcement(client):
    """Test that role hierarchy is properly enforced"""
    # Test invalid role (should default to employee level)
    token = get_auth_token(client, 'oracle', 'oracle123')
    
    # Verify role is properly detected
    response = client.get('/api/auth/verify', 
                          headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    user_data = response.get_json()
    assert user_data['user']['role'] == 'employee'
