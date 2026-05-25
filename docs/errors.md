# Errors

All error responses use a consistent envelope:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description.",
  "details": { }
}
```

`details` is present only when additional context is available (e.g., per-field validation errors).

## Error codes

### 401 — UNAUTHORIZED

```json
{
  "error": "UNAUTHORIZED",
  "message": "API key is revoked."
}
```

Missing `Authorization` header, invalid key, revoked/suspended key, or expired rotation grace.

### 403 — ACCESS_REVOKED

```json
{
  "error": "ACCESS_REVOKED",
  "message": "Partner access to this company has been revoked.",
  "details": { "companyId": "co_67" }
}
```

Your key previously had access to this company, but it was toggled off.

### 404 — JOB_NOT_FOUND

```json
{
  "error": "JOB_NOT_FOUND",
  "message": "Job not found.",
  "details": { "jobId": "job_99999" }
}
```

The job doesn't exist, or you don't have access to the company that owns it. We don't distinguish between these cases to prevent existence probing.

### 404 — APPLICATION_NOT_FOUND

```json
{
  "error": "APPLICATION_NOT_FOUND",
  "message": "Application not found.",
  "details": { "id": "ej_app_99999" }
}
```

The application doesn't exist or wasn't submitted by your key.

### 409 — JOB_CLOSED

```json
{
  "error": "JOB_CLOSED",
  "message": "Job is not accepting applications.",
  "details": { "jobId": "job_12345", "status": "closed" }
}
```

The job exists and you have access, but it's no longer open.

### 409 — DUPLICATE_SOURCE_APPLICATION_ID

```json
{
  "error": "DUPLICATE_SOURCE_APPLICATION_ID",
  "message": "An application with this sourceApplicationId already exists for this partner.",
  "details": { "sourceApplicationId": "your-id-123" }
}
```

Your `sourceApplicationId` must be unique per partner.

### 422 — VALIDATION_ERROR

```json
{
  "error": "VALIDATION_ERROR",
  "message": "One or more fields failed validation.",
  "details": {
    "errors": [
      { "field": "candidate.email", "code": "INVALID_EMAIL", "message": "candidate.email must be a valid email address." },
      { "field": "consentToContact", "code": "CONSENT_REQUIRED", "message": "consentToContact must be exactly true." }
    ]
  }
}
```

### 422 — IDEMPOTENCY_KEY_REQUIRED

```json
{
  "error": "IDEMPOTENCY_KEY_REQUIRED",
  "message": "Idempotency-Key header is required for POST requests."
}
```

### 422 — IDEMPOTENCY_KEY_REUSED

```json
{
  "error": "IDEMPOTENCY_KEY_REUSED",
  "message": "This Idempotency-Key was used with a different request body."
}
```

Same key + different body bytes. Generate a new UUID for each distinct submission.

### 429 — RATE_LIMITED

```json
{
  "error": "RATE_LIMITED",
  "message": "Rate limit exceeded for company co_67.",
  "scope": "partner_company",
  "companyId": "co_67",
  "retryAfter": 18
}
```

See [Rate Limits](/rate-limits) for per-endpoint buckets and retry guidance.

### 500 — INTERNAL_ERROR

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred."
}
```

Retry with exponential backoff. If persistent, contact partnerships@employjoy.ai.

## Retry guidance

| Code | Retry? | Action |
|------|--------|--------|
| 401 | No | Fix your API key |
| 403 | No | Access was revoked — contact EmployJoy |
| 404 | No | Resource doesn't exist or isn't yours |
| 409 | No | Conflict — job closed or duplicate |
| 422 | No | Fix request payload |
| 429 | Yes | Respect `Retry-After` header, then retry |
| 500 | Yes | Exponential backoff (1s, 2s, 4s, 8s…) |
