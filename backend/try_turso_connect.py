import os
import traceback

DB_URL = os.getenv('DATABASE_URL')
TURSO_TOKEN = os.getenv('TURSO_AUTH_TOKEN') or os.getenv('LIBSQL_AUTH_TOKEN')
print('DATABASE_URL=', DB_URL)
print('TURSO_TOKEN set?', bool(TURSO_TOKEN))

candidates = ['libsql','libsql_client','libsql.client','libsql_client.client']

for name in ['libsql','libsql_client']:
    print('\n--- trying import', name)
    try:
        mod = __import__(name)
        print('Imported', name, '->', [a for a in dir(mod) if not a.startswith('_')][:40])
        if hasattr(mod, 'connect'):
            print('has connect, trying connect(DB_URL)')
            try:
                conn = mod.connect(DB_URL)
                print('connect returned', type(conn))
                # try simple execute if available
                if hasattr(conn, 'execute'):
                    try:
                        cur = conn.execute('SELECT 1')
                        print('execute ok, fetchone:', getattr(cur,'fetchone', lambda:None)())
                    except Exception as e:
                        print('execute failed:', e)
                else:
                    print('conn has no execute')
            except Exception as e:
                print('connect(...) failed:', e)
        for attr in ('Client','LibSQLClient','ModernClient'):
            if hasattr(mod, attr):
                print('Found', attr, 'trying instantiate')
                try:
                    cls = getattr(mod, attr)
                    try:
                        inst = cls(DB_URL)
                        print('instantiated', type(inst))
                        if hasattr(inst, 'execute'):
                            try:
                                cur = inst.execute('SELECT 1')
                                print('execute OK', cur)
                            except Exception as e:
                                print('execute failed on inst:', e)
                        else:
                            print('instance has no execute')
                    except Exception as e:
                        print('instantiation failed:', e)
                except Exception as e:
                    print('error accessing class', attr, e)
    except Exception as e:
        print('import failed:', e)
        traceback.print_exc()

print('\nDone')
