import sqlite3
import json
import os
from datetime import datetime

DB = os.path.join(os.path.dirname(__file__), 'armory.db')

ALLIES = [
    {
        'hero_id': '1001',
        'name': 'Guardian',
        'image': 'https://example.org/images/guardian.png',
        'biography': {'publisher': 'Local Agency', 'alignment': 'good', 'full-name': 'Marcus Vale'},
        'powerstats': {'strength': 85, 'speed': 60, 'intelligence': 75},
        'work': {'occupation': 'Field Agent', 'base': 'Wayne Facility'},
        'connections': 'Unit: Alpha',
        'appearance': {'gender': 'Male', 'race': 'Human'}
    },
    {
        'hero_id': '1002',
        'name': 'Sentinel',
        'image': 'https://example.org/images/sentinel.png',
        'biography': {'publisher': 'Local Agency', 'alignment': 'good', 'full-name': 'Elena Cruz'},
        'powerstats': {'strength': 65, 'speed': 80, 'intelligence': 88},
        'work': {'occupation': 'Intel Analyst', 'base': 'HQ'},
        'connections': 'Unit: Beta',
        'appearance': {'gender': 'Female', 'race': 'Human'}
    },
    {
        'hero_id': '2001',
        'name': 'Rogue Operative',
        'image': None,
        'biography': {'publisher': 'Unknown', 'alignment': 'neutral', 'full-name': 'Unknown'},
        'powerstats': {'strength': 40, 'speed': 45, 'intelligence': 60},
        'work': {'occupation': 'Unknown', 'base': 'Unknown'},
        'connections': 'No known affiliations',
        'appearance': {'gender': 'Unknown', 'race': 'Unknown'}
    }
]

INVENTORY = [
    ('Tactical Cloak', 'Equipment', 12, 'Adaptive stealth cloak used for infiltration', '🦊'),
    ('Recon Drone Mk-II', 'Equipment', 6, 'Long-range recon drone with night vision', '🚁'),
    ('Ballistic Helmet', 'Equipment', 20, 'Advanced helmet with HUD', '🪖'),
    ('Armored Transport', 'Vehicle', 2, 'Heavy duty transport for extraction', '🚚')
]


def seed():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Ensure tables exist (idempotent if backend init_db already ran)
    cur.execute("""
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
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        description TEXT,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    )
    """)

    # Insert or update allies
    for a in ALLIES:
        cur.execute('SELECT id FROM allies WHERE hero_id = ?', (a['hero_id'],))
        if cur.fetchone():
            cur.execute(
                'UPDATE allies SET name=?, image=?, biography=?, powerstats=?, work=?, connections=?, appearance=?, fetched_at=? WHERE hero_id=?',
                (
                    a['name'],
                    a['image'],
                    json.dumps(a['biography']),
                    json.dumps(a['powerstats']),
                    json.dumps(a['work']),
                    a['connections'],
                    json.dumps(a['appearance']),
                    int(datetime.utcnow().timestamp()),
                    a['hero_id']
                )
            )
        else:
            cur.execute(
                'INSERT INTO allies (hero_id, name, image, biography, powerstats, work, connections, appearance, fetched_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (
                    a['hero_id'],
                    a['name'],
                    a['image'],
                    json.dumps(a['biography']),
                    json.dumps(a['powerstats']),
                    json.dumps(a['work']),
                    a['connections'],
                    json.dumps(a['appearance']),
                    int(datetime.utcnow().timestamp())
                )
            )

    # Insert inventory items if not present by name
    for name, category, qty, desc, icon in INVENTORY:
        cur.execute('SELECT id FROM inventory WHERE name = ?', (name,))
        if cur.fetchone():
            cur.execute('UPDATE inventory SET category=?, quantity=?, description=?, icon=?, updated_at=CURRENT_TIMESTAMP WHERE name = ?', (category, qty, desc, icon, name))
        else:
            cur.execute('INSERT INTO inventory (name, category, quantity, description, icon) VALUES (?, ?, ?, ?, ?)', (name, category, qty, desc, icon))

    # Insert default users
    USERS = [
        ('batman', 'wayne123', 'admin'),
        ('robin', 'robin123', 'manager'),
        ('oracle', 'oracle123', 'employee')
    ]
    for u, p, r in USERS:
        cur.execute('SELECT id FROM users WHERE username = ?', (u,))
        if not cur.fetchone():
            cur.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', (u, p, r))

    conn.commit()
    conn.close()


if __name__ == '__main__':
    print('Seeding database:', DB)
    seed()
    print('Seeding complete')
