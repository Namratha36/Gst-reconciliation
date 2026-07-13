import requests

try:
    res = requests.post(
        'http://127.0.0.1:8000/api/auth/register', 
        json={'name':'Test User','email':'test2@example.com','password':'password','organizationName':'Acme'}
    )
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text)
except Exception as e:
    print("EXCEPTION:", e)
