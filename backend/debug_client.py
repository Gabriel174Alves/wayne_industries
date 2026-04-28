from app import app

def run_debug():
    with app.test_client() as c:
        login = c.post('/api/auth/login', json={'username':'batman','password':'wayne123','role':'admin'})
        print('LOGIN:', login.status_code, login.get_data(as_text=True))
        token = None
        try:
            token = login.get_json().get('token')
        except Exception:
            pass
        print('TOKEN:', token)

        inv = c.get('/api/inventory', headers={'Authorization': f'Bearer {token}'})
        print('INVENTORY:', inv.status_code, inv.get_data(as_text=True))

        verify = c.get('/api/auth/verify', headers={'Authorization': f'Bearer {token}'})
        print('VERIFY:', verify.status_code, verify.get_data(as_text=True))

if __name__ == '__main__':
    run_debug()
