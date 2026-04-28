import importlib
names = ['libsql','libsql_client']
for n in names:
    try:
        m = importlib.import_module(n)
        print('MODULE', n)
        print('DIR:', [a for a in dir(m) if not a.startswith('_')])
        if hasattr(m, 'connect'):
            print('HAS connect')
        for attr in ('Client','LibSQLClient','ModernClient'):
            if hasattr(m, attr):
                print('HAS', attr)
    except Exception as e:
        print('Import failed for', n, '->', e)
