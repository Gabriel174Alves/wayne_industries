import requests, json

login = requests.post('http://127.0.0.1:5000/api/auth/login', json={'username':'batman','password':'wayne123','role':'admin'})
print('LOGIN STATUS:', login.status_code)
try:
    print(json.dumps(login.json(), indent=2, ensure_ascii=False))
except Exception:
    print(login.text)

if login.status_code == 200:
    token = login.json().get('token')
    headers = {'Authorization': f'Bearer {token}'}
    resp = requests.get('http://127.0.0.1:5000/api/allies/fetch/batman', headers=headers, timeout=20)
    print('\nFETCH STATUS:', resp.status_code)
    try:
        print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
    except Exception:
        print(resp.text)
else:
    print('Login failed')
