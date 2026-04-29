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

def get_auth_token(client):
    """Helper to get auth token for admin user"""
    response = client.post('/api/auth/login', json={
        'username': 'batman',
        'password': 'wayne123'
    })
    return json.loads(response.data)['token']

def test_inventory_quantity_limit(client):
    """Test inventory quantity limit validation (max 100)"""
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Test creating item with quantity > 100 (should fail)
    response = client.post('/api/inventory', 
                          json={
                              'name': 'Test Item Excess',
                              'category': 'Equipment',
                              'quantity': 150,
                              'description': 'Test item with excess quantity'
                          }, headers=headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Quantidade máxima permitida é 100 unidades por item' in data['error']
    
    # Test creating item with valid quantity (should pass)
    response = client.post('/api/inventory', 
                          json={
                              'name': 'Test Item Valid',
                              'category': 'Equipment',
                              'quantity': 50,
                              'description': 'Test item with valid quantity'
                          }, headers=headers)
    assert response.status_code == 201
    
    # Test updating item with quantity > 100 (should fail)
    response = client.put('/api/inventory/1', 
                          json={
                              'name': 'Batmóvel',
                              'category': 'Vehicle',
                              'quantity': 200,
                              'description': 'Updated with excess quantity'
                          }, headers=headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Quantidade máxima permitida é 100 unidades por item' in data['error']

def test_inventory_negative_quantity(client):
    """Test inventory negative quantity validation"""
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Test creating item with negative quantity (should fail)
    response = client.post('/api/inventory', 
                          json={
                              'name': 'Test Item Negative',
                              'category': 'Equipment',
                              'quantity': -10,
                              'description': 'Test item with negative quantity'
                          }, headers=headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Quantidade não pode ser negativa' in data['error']

def test_ally_alignment_validation(client):
    """Test ally alignment validation (must be 'good')"""
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Test creating ally with 'bad' alignment (should fail)
    response = client.post('/api/allies', 
                          json={
                              'hero_id': 'test1',
                              'name': 'Joker',
                              'biography': {
                                  'alignment': 'bad',
                                  'publisher': 'DC Comics'
                              },
                              'powerstats': {'strength': 50},
                              'work': {'occupation': 'Villain'},
                              'connections': 'Gotham Underground',
                              'appearance': {'gender': 'Male'}
                          }, headers=headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Apenas aliados com alinhamento "good" são permitidos' in data['error']
    
    # Test creating ally with 'good' alignment (should pass)
    response = client.post('/api/allies', 
                          json={
                              'hero_id': 'test2',
                              'name': 'Superman',
                              'biography': {
                                  'alignment': 'good',
                                  'publisher': 'DC Comics'
                              },
                              'powerstats': {'strength': 100},
                              'work': {'occupation': 'Hero'},
                              'connections': 'Daily Planet',
                              'appearance': {'gender': 'Male'}
                          }, headers=headers)
    assert response.status_code == 201

def test_ally_publisher_validation(client):
    """Test ally publisher validation (must be DC or Marvel)"""
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Test creating ally with invalid publisher (should fail)
    response = client.post('/api/allies', 
                          json={
                              'hero_id': 'test3',
                              'name': 'Spider-Ham',
                              'biography': {
                                  'alignment': 'good',
                                  'publisher': 'Image Comics'
                              },
                              'powerstats': {'strength': 30},
                              'work': {'occupation': 'Comedy Hero'},
                              'connections': 'Funny Pages',
                              'appearance': {'gender': 'Male'}
                          }, headers=headers)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Apenas aliados de "DC Comics" ou "Marvel Comics" são permitidos' in data['error']
    
    # Test creating ally with Marvel publisher (should pass)
    response = client.post('/api/allies', 
                          json={
                              'hero_id': 'test4',
                              'name': 'Spider-Man',
                              'biography': {
                                  'alignment': 'good',
                                  'publisher': 'Marvel Comics'
                              },
                              'powerstats': {'strength': 65},
                              'work': {'occupation': 'Photographer'},
                              'connections': 'Daily Bugle',
                              'appearance': {'gender': 'Male'}
                          }, headers=headers)
    assert response.status_code == 201

def test_logs_retention_functionality(client):
    """Test logs endpoint exists and returns data"""
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test logs endpoint is accessible
    response = client.get('/api/logs', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'logs' in data
    assert isinstance(data['logs'], list)

def test_role_based_access_control(client):
    """Test role-based access control for different operations"""
    # Test with admin user (should have full access)
    admin_token = get_auth_token(client)
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    
    response = client.get('/api/inventory', headers=admin_headers)
    assert response.status_code == 200
    
    # Test with employee user (should have limited access)
    response = client.post('/api/auth/login', json={
        'username': 'oracle',
        'password': 'oracle123'
    })
    employee_token = json.loads(response.data)['token']
    employee_headers = {'Authorization': f'Bearer {employee_token}'}
    
    # Employee should be able to read inventory
    response = client.get('/api/inventory', headers=employee_headers)
    assert response.status_code == 200
    
    # Employee should be able to read allies
    response = client.get('/api/allies', headers=employee_headers)
    assert response.status_code == 200
