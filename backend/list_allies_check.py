import sqlite3
import json
import os

DB = os.getenv('DATABASE', 'armory.db')

def load_allowed():
    env = os.getenv('ALLOWED_PUBLISHERS', 'DC Comics,Marvel Comics')
    allowed = {p.strip().lower() for p in env.split(',') if p.strip()}
    req_align = os.getenv('REQUIRED_ALIGNMENT', '').strip().lower()
    return allowed, req_align

def main():
    allowed, req_align = load_allowed()
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.execute('SELECT id, hero_id, name, biography FROM allies ORDER BY id')
    rows = cur.fetchall()
    if not rows:
        print('No allies found.')
        return

    print(f"Allowed publishers: {', '.join(sorted(allowed))} | Required alignment: '{req_align or 'ANY'}'\n")
    for r in rows:
        bio = r['biography'] or '{}'
        pub = ''
        align = ''
        try:
            bioj = json.loads(bio)
            pub = (bioj.get('publisher') or '').strip()
            align = (bioj.get('alignment') or '').strip()
        except Exception:
            pub = ''
            align = ''
        pub_key = pub.lower()
        allowed_flag = (not allowed) or (pub_key in allowed)
        align_flag = (not req_align) or (align.lower() == req_align)
        status = 'KEEP' if allowed_flag and align_flag else 'REMOVE'
        print(f"id={r['id']:3} hero_id={r['hero_id']:6} name={r['name'][:30]:30} publisher={pub:20} alignment={align:6} => {status}")

    conn.close()

if __name__ == '__main__':
    main()
