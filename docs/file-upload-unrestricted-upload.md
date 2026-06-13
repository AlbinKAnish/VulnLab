# File Upload Lab — Unrestricted Upload

## Lab Overview

This lab demonstrates an **Unrestricted File Upload vulnerability** where the application accepts dangerous file types without proper validation.

Attackers can upload malicious files that should normally be blocked by the server.

---

## Vulnerability Type

Unrestricted File Upload

OWASP Category:

A05:2021 — Security Misconfiguration

A01:2021 — Broken Access Control

---

## Scenario

Employees can upload profile pictures through the internal employee portal.

Application claims only image uploads are allowed:

```text
.jpg
.png
```

Upload endpoint:

```text
POST /api/upload/upload
```

Uploaded files are stored publicly.

---

## Normal Usage

Normal upload:

```text
avatar.png
```

Response:

```json
{
  "message": "File uploaded successfully",
  "filename": "avatar.png",
  "path": "/api/upload/files/avatar.png"
}
```

---

## Enumeration Clues

Developer notes reveal:

```text
Uploaded files are stored publicly.

Public file path:

/api/upload/files/{filename}

TODO:
Add proper file validation later.
```

This suggests uploaded files are directly accessible.

---

## Exploit Payload

Instead of an image file, upload:

```text
payload.php
```

Example payload:

```php
<?php
echo "VulnLab Upload Test";
?>
```

Request:

```text
POST /api/upload/upload
```

with:

```text
multipart/form-data
```

---

## Successful Exploitation

Server response:

```json
{
  "message": "File uploaded successfully",
  "filename": "payload.php",
  "path": "/api/upload/files/payload.php"
}
```

Uploaded file becomes publicly accessible:

```text
/api/upload/files/payload.php
```

---

## Impact

Attacker gains ability to:

✔ Upload dangerous file types

✔ Store malicious files publicly

✔ Bypass intended upload restrictions

Possible consequences:

```text
Remote Code Execution
Web shell uploads
Malware hosting
Stored payload delivery
Server compromise
```

---

## Root Cause

Application trusts uploaded files without validation.

Example vulnerable logic:

```javascript
const upload = multer({ storage });
```

Missing protections:

```text
No extension validation
No MIME type validation
No content inspection
No dangerous file blocking
```

---

## Secure Fixes

### Allowlist file types

Only allow:

```text
.jpg
.png
.jpeg
```

---

### Validate MIME types

Reject dangerous content types such as:

```text
application/x-php
application/octet-stream
```

---

### Rename uploaded files

Avoid using user-controlled filenames.

Generate random filenames:

```text
upload_92831.png
```

---

### Store uploads outside public directories

Never expose uploaded files directly through:

```text
/uploads/
```

---

### Block executable extensions

Reject:

```text
.php
.jsp
.asp
.exe
.sh
```

---

## Learning Objectives

After completing this lab learners should understand:

- Unrestricted File Upload vulnerabilities
- Dangerous file uploads
- Public upload exposure
- Weak validation risks
- Secure file upload handling

---

## Lab Information

Lab:

File Upload — Unrestricted Upload

Difficulty:

Medium

Category:

File Upload / Validation

Status:

✔ Completed