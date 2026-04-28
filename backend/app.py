import os
import sqlite3
import sys
from datetime import timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import json
import time
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Load JWT secret from environment and enforce a strong key in production
jwt_secret = os.getenv('JWT_SECRET_KEY')
flask_env = os.getenv('FLASK_ENV', 'development')
insecure_defaults = {'wayne-jwt-secret-2024', 'change-me-to-a-strong-secret', 'default', ''}

if (not jwt_secret or jwt_secret in insecure_defaults or len(jwt_secret or '') < 32) and flask_env == 'production':
    print('\nERROR: insecure or missing JWT_SECRET_KEY.\n', file=sys.stderr)
    print('Set a secure JWT_SECRET_KEY (at least 32 characters) in your .env or environment before starting in production.', file=sys.stderr)
    sys.exit(1)

if not jwt_secret or jwt_secret in insecure_defaults or len(jwt_secret or '') < 32:
    print('Warning: using insecure or missing JWT_SECRET_KEY (allowed in development only).', file=sys.stderr)

app.config['JWT_SECRET_KEY'] = jwt_secret or 'wayne-jwt-secret-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
# Prefer DATABASE_URL (e.g. libsql://... for Turso) falling back to local SQLite file
app.config['DATABASE_URL'] = os.getenv('DATABASE_URL', os.getenv('TURSO_DB_URL'))
if app.config['DATABASE_URL']:
    app.config['DATABASE'] = app.config['DATABASE_URL']
else:
    app.config['DATABASE'] = 'armory.db'

CORS(app)
jwt = JWTManager(app)

# External SuperHero API disabled in local-only mode. Allies are managed locally using SQLite.

# Configurable filters: limit which publishers/alignments are accepted into the allies table
ALLOWED_PUBLISHERS_ENV = os.getenv('ALLOWED_PUBLISHERS', 'DC Comics,Marvel Comics')
ALLOWED_PUBLISHERS = {p.strip().lower() for p in ALLOWED_PUBLISHERS_ENV.split(',') if p.strip()}
REQUIRED_ALIGNMENT = os.getenv('REQUIRED_ALIGNMENT', '').strip().lower()  # e.g. 'good' to only include heroes aligned as good

# Path to built frontend (production build)
FRONTEND_DIST = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

# Database initialization
def get_db():
    """Get database connection.

    Supports three modes:
    - SQLite local file (default) using builtin `sqlite3`
    - libsql/Turso when `DATABASE_URL` starts with `libsql://` and `libsql` client is installed
    - If `libsql` is required but not installed, raises RuntimeError with instructions
    """
    db_target = app.config.get('DATABASE')

    # Allow forcing local SQLite for development/testing when Turso is unavailable
    if os.getenv('USE_SQLITE', '').lower() in ('1', 'true', 'yes'):
        db_target = 'armory.db'

    # libsql/Turso connection (requires libsql Python client)
    if isinstance(db_target, str) and db_target.startswith('libsql://'):
        # If an auth token is provided in env, append it to the URL when missing
        turso_token = os.getenv('TURSO_AUTH_TOKEN') or os.getenv('LIBSQL_AUTH_TOKEN')
        if turso_token and 'auth_token=' not in db_target:
            sep = '&' if '?' in db_target else '?'
            db_target = f"{db_target}{sep}auth_token={turso_token}"
        # Try multiple possible package/module names for the libsql client
        libsql_mod = None
        import_errors = []
        for mod_name in ('libsql', 'libsql_client'):
            try:
                libsql_mod = __import__(mod_name)
                break
            except Exception as e:
                import_errors.append((mod_name, str(e)))

        if libsql_mod is None:
            print("Warning: libsql client not installed; falling back to local SQLite (armory.db).", file=sys.stderr)
            db_target = 'armory.db'
        else:
            # The client packages expose different connection APIs across versions. Try common ones.
            # 1) libsql.connect(db_url)
            if hasattr(libsql_mod, 'connect'):
                try:
                    conn = libsql_mod.connect(db_target)
                    # Ensure the returned object behaves like a DB-API connection (has execute)
                    if hasattr(conn, 'execute'):
                        return conn
                    else:
                        print("Warning: libsql client returned incompatible connection object; falling back to local SQLite (armory.db).", file=sys.stderr)
                        db_target = 'armory.db'
                except Exception:
                    pass

            # 2) libsql.Client(db_url) or libsql.ModernClient
            for client_attr in ('Client', 'LibSQLClient', 'ModernClient'):
                if hasattr(libsql_mod, client_attr):
                    try:
                        client_cls = getattr(libsql_mod, client_attr)
                        client = client_cls(db_target)
                        if hasattr(client, 'execute'):
                            return client
                        else:
                            print("Warning: libsql client instance not sqlite-compatible; falling back to local SQLite (armory.db).", file=sys.stderr)
                            db_target = 'armory.db'
                    except Exception:
                        pass

            # If none of the above worked, fallback to SQLite with a warning
            print("Warning: unable to initialize libsql client (incompatible API); falling back to local SQLite (armory.db).", file=sys.stderr)
            db_target = 'armory.db'

    # Default: SQLite file
    conn = sqlite3.connect(db_target)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with schema"""
    with app.app_context():
        db = get_db()
        db.executescript('''
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                quantity INTEGER DEFAULT 0,
                description TEXT,
                icon TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')

        # Create tables matching the exact schema requested by the user
        db.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS allies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hero_id TEXT UNIQUE,
                name TEXT,
                image TEXT,
                biography TEXT,
                powerstats TEXT,
                work TEXT,
                connections TEXT,
                appearance TEXT,
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS revoked_tokens (
                jti TEXT PRIMARY KEY,
                user_id INTEGER,
                revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        db.commit()
        db.close()

        # Ensure inventory seed is present (re-open DB)
        db = get_db()
        cursor = db.execute('SELECT COUNT(*) FROM inventory')
        if cursor.fetchone()[0] == 0:
            seed_data = [
                ('Batmóvel', 'Vehicle', 1, 'Advanced tactical vehicle with military-grade armor', '🚗'),
                ('Batwing', 'Vehicle', 1, 'High-speed aerial vehicle with advanced weaponry', '🛩️'),
                ('Batarang', 'Equipment', 50, 'Razor-sharp throwing weapon', '⚔️'),
                ('Grappling Hook', 'Equipment', 15, 'Advanced grappling device for vertical movement', '🪝'),
                ('Smoke Pellets', 'Equipment', 120, 'Non-lethal smoke screen deployment', '💨'),
                ('Flashbang', 'Equipment', 30, 'Non-lethal stun and disorientation device', '⚡'),
                ('Surveillance Drone', 'Equipment', 8, 'High-definition aerial reconnaissance', '🚁'),
                ('Body Armor', 'Equipment', 12, 'Kevlar tactical protective suit', '🛡️'),
                ('Utility Belt', 'Equipment', 5, 'Advanced multi-tool tactical equipment', '🎒'),
                ('Night Vision Goggles', 'Equipment', 10, 'Thermal and infrared vision capability', '👓'),
            ]
            for name, category, qty, desc, icon in seed_data:
                db.execute(
                    'INSERT INTO inventory (name, category, quantity, description, icon) VALUES (?, ?, ?, ?, ?)',
                    (name, category, qty, desc, icon)
                )
            db.commit()
        db.close()


def upsert_hero(hero: dict):
    """Insert or update a hero record in the allies table.

    Returns the stored row as a dict with JSON fields parsed, or None on failure.
    """
    try:
        hero_id_str = str(hero.get('id'))
        name = hero.get('name')
        image = (hero.get('image') or {}).get('url') if hero.get('image') else None

        # powerstats as JSON string
        powerstats = json.dumps(hero.get('powerstats', {}))

        # biography -> formatted text, prefer non-empty fields
        bio = hero.get('biography', {}) or {}
        biography_parts = []
        # Preferred keys and order
        for k in ('full-name', 'alter-egos', 'aliases', 'place-of-birth', 'first-appearance', 'publisher', 'alignment'):
            v = bio.get(k)
            if v and v != '-' and v != '':
                if isinstance(v, list):
                    v = ', '.join(v)
                biography_parts.append(f"{k}: {v}")
        # Fallback: include any other non-empty bio fields
        if not biography_parts and isinstance(bio, dict):
            for k, v in bio.items():
                if v and v != '-' and v != '':
                    if isinstance(v, list):
                        v = ', '.join(v)
                    biography_parts.append(f"{k}: {v}")
        biography = '\n'.join(biography_parts)

        # appearance -> formatted text, prefer non-empty fields
        app_obj = hero.get('appearance', {}) or {}
        appearance_parts = []
        for k in ('gender', 'race', 'height', 'weight', 'eye-color', 'hair-color'):
            v = app_obj.get(k)
            if v and v != '-' and v != '':
                if isinstance(v, list):
                    v = ', '.join(v)
                appearance_parts.append(f"{k}: {v}")
        # Fallback: include any other non-empty appearance fields
        if not appearance_parts and isinstance(app_obj, dict):
            for k, v in app_obj.items():
                if v and v != '-' and v != '':
                    if isinstance(v, list):
                        v = ', '.join(v)
                    appearance_parts.append(f"{k}: {v}")
        appearance = '\n'.join(appearance_parts)

        # work -> occupation and base
        work_obj = hero.get('work', {}) or {}
        work = json.dumps({'occupation': work_obj.get('occupation'), 'base': work_obj.get('base')})

        # connections -> group-affiliation and relatives as text
        conn = hero.get('connections', {}) or {}
        connections_parts = []
        for k in ('group-affiliation', 'relatives'):
            v = conn.get(k)
            if v:
                connections_parts.append(f"{k}: {v}")
        connections = '\n'.join(connections_parts)

        # Filter by publisher/alignment to avoid inserting unrelated IPs (e.g., Star Wars characters)
        pub = (bio.get('publisher') or '').strip().lower()
        alignment = (bio.get('alignment') or '').strip().lower()
        if ALLOWED_PUBLISHERS and pub and pub not in ALLOWED_PUBLISHERS:
            print(f"Skipping hero {name} (publisher='{pub}') not in allowed publishers", file=sys.stderr)
            return None
        if REQUIRED_ALIGNMENT and alignment and alignment != REQUIRED_ALIGNMENT:
            print(f"Skipping hero {name} (alignment='{alignment}') does not match required alignment '{REQUIRED_ALIGNMENT}'", file=sys.stderr)
            return None

        db = get_db()
        cursor = db.execute('SELECT id FROM allies WHERE hero_id = ?', (hero_id_str,))
        existing = cursor.fetchone()
        ts = int(time.time())
        if existing:
            db.execute(
                'UPDATE allies SET name=?, image=?, biography=?, powerstats=?, work=?, connections=?, appearance=?, fetched_at=? WHERE hero_id=?',
                (name, image, biography, powerstats, work, connections, appearance, ts, hero_id_str)
            )
        else:
            db.execute(
                'INSERT INTO allies (hero_id, name, image, biography, powerstats, work, connections, appearance, fetched_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (hero_id_str, name, image, biography, powerstats, work, connections, appearance, ts)
            )
        db.commit()

        cursor = db.execute('SELECT * FROM allies WHERE hero_id = ?', (hero_id_str,))
        stored = cursor.fetchone()
        if not stored:
            db.close()
            return None

        row = dict(stored)
        # Parse JSON fields
        for field in ('powerstats', 'biography', 'appearance', 'work', 'connections'):
            try:
                row[field] = json.loads(row.get(field) or '{}')
            except Exception:
                row[field] = {}

        db.close()
        return row
    except Exception:
        try:
            db.close()
        except Exception:
            pass
        return None
        

# Routes

@app.route('/health', methods=['GET'], endpoint='health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'API Wayne Industries operacional'})

@app.route('/api/allies', methods=['GET'], endpoint='get_allies')
@jwt_required()
def get_allies():
    """List allies persisted in the local database (SQLite only)."""
    try:
        db = get_db()
        cursor = db.execute('SELECT * FROM allies ORDER BY id')
        rows = [dict(r) for r in cursor.fetchall()]
        db.close()

        # parse json fields
        for row in rows:
            for field in ('powerstats', 'biography', 'appearance', 'work', 'connections'):
                try:
                    row[field] = json.loads(row.get(field) or '{}')
                except Exception:
                    row[field] = {}

        return jsonify(rows), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/allies', methods=['POST'], endpoint='create_ally')
@jwt_required()
def create_ally():
    """Create a new ally record in the local DB. Accepts JSON with keys:
    hero_id, name, image, biography (dict or string), powerstats (dict), work (dict), connections (string), appearance (dict)
    """
    try:
        data = request.get_json() or {}
        if not data.get('hero_id') or not data.get('name'):
            return jsonify({'error': 'Fields hero_id and name are required'}), 400

        # Normalize JSON fields into strings
        def norm(obj):
            if obj is None:
                return '{}'
            if isinstance(obj, (dict, list)):
                return json.dumps(obj)
            return str(obj)

        hero_id = str(data.get('hero_id'))
        name = data.get('name')
        image = data.get('image')
        biography = norm(data.get('biography'))
        powerstats = norm(data.get('powerstats'))
        work = norm(data.get('work'))
        connections = norm(data.get('connections'))
        appearance = norm(data.get('appearance'))

        db = get_db()
        db.execute(
            'INSERT INTO allies (hero_id, name, image, biography, powerstats, work, connections, appearance, fetched_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (hero_id, name, image, biography, powerstats, work, connections, appearance, int(time.time()))
        )
        db.commit()
        cursor = db.execute('SELECT * FROM allies WHERE hero_id = ?', (hero_id,))
        row = cursor.fetchone()
        db.close()
        if not row:
            return jsonify({'error': 'Failed to create ally'}), 500

        out = dict(row)
        for field in ('powerstats', 'biography', 'appearance', 'work', 'connections'):
            try:
                out[field] = json.loads(out.get(field) or '{}')
            except Exception:
                out[field] = out.get(field)

        return jsonify(out), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory', methods=['GET'], endpoint='list_inventory')
@jwt_required()
def list_inventory():
    """List all inventory items"""
    try:
        db = get_db()
        cursor = db.execute('SELECT * FROM inventory ORDER BY id')
        items = [dict(row) for row in cursor.fetchall()]
        db.close()
        return jsonify(items), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory', methods=['POST'], endpoint='create_inventory_item')
@jwt_required()
def create_inventory_item():
    """Create new inventory item"""
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Campos obrigatórios ausentes'}), 400
        
        db = get_db()
        cursor = db.execute(
            'INSERT INTO inventory (name, category, quantity, description, icon) VALUES (?, ?, ?, ?, ?)',
            (
                data.get('name'),
                data.get('category', 'Equipment'),
                data.get('quantity', 0),
                data.get('description', ''),
                data.get('icon', '📦')
            )
        )
        db.commit()
        item_id = cursor.lastrowid
        db.close()
        
        return jsonify({'id': item_id, 'message': 'Item criado'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/<int:item_id>', methods=['GET'], endpoint='get_inventory_item')
@jwt_required()
def get_inventory_item(item_id):
    """Get single inventory item"""
    try:
        db = get_db()
        cursor = db.execute('SELECT * FROM inventory WHERE id = ?', (item_id,))
        item = cursor.fetchone()
        db.close()
        
        if not item:
            return jsonify({'error': 'Item não encontrado'}), 404
        
        return jsonify(dict(item)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/<int:item_id>', methods=['PUT'], endpoint='update_inventory_item')
@jwt_required()
def update_inventory_item(item_id):
    """Update inventory item"""
    try:
        data = request.get_json()
        db = get_db()
        
        db.execute(
            'UPDATE inventory SET name=?, category=?, quantity=?, description=?, icon=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
            (
                data.get('name'),
                data.get('category'),
                data.get('quantity'),
                data.get('description'),
                data.get('icon'),
                item_id
            )
        )
        db.commit()
        db.close()
        
        return jsonify({'message': 'Item atualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def _user_role():
    try:
        claims = get_jwt()
        # role may be present at top-level claim or inside 'user'
        role = claims.get('role') or claims.get('user', {}).get('role')
        return (role or '').lower()
    except Exception:
        return ''


def _require_role(required_role):
    def wrapper():
        role = _user_role()
        return role == required_role
    return wrapper


@app.route('/api/inventory/<int:item_id>', methods=['DELETE'], endpoint='delete_inventory_item')
@jwt_required()
def delete_inventory_item(item_id):
    """Delete inventory item (Admin only)"""
    try:
        if _user_role() != 'admin':
            return jsonify({'error': 'Ação proibida: Administradores apenas'}), 403

        db = get_db()
        db.execute('DELETE FROM inventory WHERE id = ?', (item_id,))
        db.commit()
        db.close()

        return jsonify({'message': 'Item excluído'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# External fetch endpoints removed — local-only mode


# /api/allies now lists local allies; duplicate DB-only endpoint removed in local-only mode


# External sync endpoint removed for local-only mode


# External fetch endpoint removed for local-only mode

# Authentication Routes

VALID_USERS = {
    'batman': {
        'password': 'wayne123',
        'roles': ['admin', 'manager', 'employee']
    },
    'robin': {
        'password': 'robin123',
        'roles': ['manager', 'employee']
    },
    'oracle': {
        'password': 'oracle123',
        'roles': ['employee']
    }
}

@app.route('/api/auth/login', methods=['POST'], endpoint='login')
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'employee').lower()
        
        if not username or not password:
            return jsonify({'error': 'Nome de usuário ou senha ausentes'}), 400
        
        # Mock authentication
        user = VALID_USERS.get(username)
        if not user or user.get('password') != password:
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Validate role
        if role not in user.get('roles', []):
            return jsonify({'error': f'Usuário {username} não possui a função {role}'}), 403
        
        # Create JWT token: use username as subject and add user info in claims
        access_token = create_access_token(identity=username, additional_claims={'user': {'username': username, 'role': role}, 'role': role})

        return jsonify({
            'token': access_token,
            'username': username,
            'role': role,
            'message': 'Login bem-sucedido'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'], endpoint='verify_token')
@jwt_required()
def verify_token():
    """Verify JWT token is valid and return user claims"""
    jwt_data = get_jwt()
    user = jwt_data.get('user', {})
    return jsonify({'valid': True, 'user': user}), 200

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500


@app.route('/api/logs', methods=['GET'], endpoint='get_logs')
@jwt_required()
def get_logs():
    """Return last lines from backend_log.txt for quick audit view"""
    try:
        log_path = os.path.join(os.path.dirname(__file__), 'backend_log.txt')
        if not os.path.exists(log_path):
            return jsonify({'logs': [], 'message': 'Log file não encontrado'}), 200

        # Read last 2000 chars to avoid huge payloads
        with open(log_path, 'rb') as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            start = max(0, size - 2000)
            f.seek(start)
            data = f.read().decode('utf-8', errors='ignore')

        lines = data.strip().splitlines()
        # Return last 50 lines
        return jsonify({'logs': lines[-50:]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize and run

if __name__ == '__main__':
    init_db()
    print("🦇 Wayne Industries Asset Management System - Backend v1.0")
    print("🔌 Starting Flask server on http://127.0.0.1:5000")
    print("📡 API Documentation:")
    print("   GET /api/allies - List saved allies (requires JWT)")
    print("   POST /api/allies - Create new ally (requires JWT)")
    print("   GET /api/inventory - List items (requires JWT)")
    print("   POST /api/auth/login - Get JWT token")
    app.run(debug=True, host='127.0.0.1', port=5000)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the built frontend from frontend/dist. If file exists, return it; otherwise return index.html for SPA routing."""
    try:
        # Serve actual file if it exists
        if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
            return send_from_directory(FRONTEND_DIST, path)
        # Default to index.html for SPA
        return send_from_directory(FRONTEND_DIST, 'index.html')
    except Exception:
        return jsonify({'error': 'Arquivos do frontend não encontrados; execute cd frontend && npm run build'}), 500
