# Wayne Industries - Asset Management System (Backend)

## Tech Stack
- Flask 2.3
- SQLAlchemy / SQLite
- Flask-JWT-Extended (JWT authentication)
- Flask-CORS (Cross-origin support)
- Requests (Superhero API proxy)

## Project Structure

```
backend/
├── app.py              # Main Flask app with all routes
├── requirements.txt    # Python dependencies
├── armory.db          # SQLite database (auto-generated)
├── test_app.py        # Pytest tests
└── .env.example       # Environment variables template
```

## Setup

### 1. Create Virtual Environment

```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Create Environment File

```bash
cp .env.example .env
```

### 4. Run Flask Server

```bash
python app.py
```

Server will start at `http://127.0.0.1:5000`

## API Endpoints

### Authentication

**POST /api/auth/login**
- Get JWT token
- Request:
  ```json
  {
    "username": "batman",
    "password": "wayne123",
    "role": "admin"
  }
  ```
- Response:
  ```json
  {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "username": "batman",
    "role": "admin"
  }
  ```

**GET /api/auth/verify**
- Verify JWT token validity
- Headers: `Authorization: Bearer <token>`

### Allies (Superhero API Proxy)

**GET /api/allies**
- Fetch 3 heroes from Superhero API (Batman, Flash, Nightwing)
- Returns: Array of allies with powerstats, biography, work base
- Headers: `Authorization: Bearer <token>` (required)
- Response:
  ```json
  [
    {
      "id": 70,
      "name": "Batman",
      "image": "https://...",
      "biography": {...},
      "powerstats": {
        "Intelligence": 81,
        "Strength": 40,
        "Speed": 29,
        "Durability": 55,
        "Power": 63,
        "Combat": 90
      },
      "work": {
        "base": "Gotham City"
      }
    }
  ]
  ```

### Inventory (CRUD)

**GET /api/inventory**
- List all inventory items
- Headers: `Authorization: Bearer <token>` (required)

**GET /api/inventory/<id>**
- Get single inventory item

**POST /api/inventory**
- Create new inventory item
- Request:
  ```json
  {
    "name": "New Equipment",
    "category": "Equipment",
    "quantity": 25,
    "description": "Description...",
    "icon": "🎯"
  }
  ```

**PUT /api/inventory/<id>**
- Update inventory item
- Same request body as POST

**DELETE /api/inventory/<id>**
- Delete inventory item

## Test Users

Username | Password  | Roles
---------|-----------|------------------------
batman   | wayne123  | admin, manager, employee
robin    | robin123  | manager, employee
oracle   | oracle123 | employee

## Seed Data

On first run, database auto-populates with:
- 2 Vehicles: Batmóvel, Batwing
- 8 Equipment types: Batarang, Grappling Hook, Smoke Pellets, Flashbang, Surveillance Drone, Body Armor, Utility Belt, Night Vision Goggles

## Running Tests

```bash
pytest test_app.py -v
```

## Database

SQLite database located at `backend/armory.db`

### Schema

**inventory** table:
- id (PRIMARY KEY)
- name (TEXT)
- category (TEXT)
- quantity (INTEGER)
- description (TEXT)
- icon (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Key Features

1. **JWT Authentication** - Secure API endpoints with token-based auth
2. **Superhero API Proxy** - Fetch real hero data and expose via our API
3. **CRUD Inventory** - Manage equipment and vehicles
4. **Role-Based Access** - Admin, Manager, Employee roles
5. **CORS Support** - Allow frontend requests from localhost:5173
6. **SQLite Persistence** - Local database for inventory data

## Integration with Frontend

Frontend connects via:
- `VITE_API_URL=http://127.0.0.1:5000`
- Stores JWT token in localStorage
- Sends token in `Authorization: Bearer <token>` header for all requests

## Troubleshooting

### Port 5000 already in use
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database locked error
Delete `armory.db` and restart server (will recreate with fresh seed data)

### CORS errors
Check that Flask-CORS is installed and app.py includes `CORS(app)`

## Next Steps

1. Install backend dependencies: `pip install -r requirements.txt`
2. Start backend: `python app.py`
3. Test endpoints with curl or Postman
4. Start frontend (see /frontend/README.md)
5. Access at `http://localhost:5173` and login with test credentials
