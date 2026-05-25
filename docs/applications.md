# Applications

Submit candidates to jobs and track their progress through the hiring pipeline.

## Submit an application

### `POST /api/v1/external/applications`

#### Required headers

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer YOUR_API_KEY_HERE` |
| `Idempotency-Key` | UUID v4 (unique per submission attempt) |
| `Content-Type` | `application/json` |

#### Request body

```json
{
  "jobId": "job_12345",
  "candidate": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+15551234567"
  },
  "consentToContact": true,
  "source": "indeed",
  "sourceApplicationId": "your-internal-id-123",
  "applicationFormAnswers": {
    "drivers_license": true
  },
  "resumeUrl": "https://your-cdn.com/resumes/jane-doe.pdf"
}
```

#### Field descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `jobId` | Yes | Job to apply to (from `GET /jobs` response) |
| `candidate.firstName` | Yes | 1-100 characters |
| `candidate.lastName` | Yes | 1-100 characters |
| `candidate.email` | Yes | Valid email address |
| `candidate.phone` | Yes | E.164 format recommended (e.g. `+15551234567`). We normalize |
| `consentToContact` | Yes | Must be `true`. Applicant consents to SMS/email outreach |
| `source` | No | Upstream channel (e.g. `indeed`, `linkedin`, `facebook`) |
| `sourceApplicationId` | No | Your internal ID for this application (max 128 chars). Returned in webhooks |
| `applicationFormAnswers` | No | Key-value answers matching the job's `applicationFormSchema` |
| `resumeUrl` | No | We fetch the file asynchronously; fetch failure is non-fatal |

#### Response (201 Created)

```json
{
  "id": "ej_app_789",
  "sourceApplicationId": "your-internal-id-123",
  "jobId": "job_12345",
  "status": "received",
  "createdAt": "2026-05-22T14:30:11Z"
}
```

#### Error responses

| Status | Code | When |
|--------|------|------|
| 422 | `IDEMPOTENCY_KEY_REQUIRED` | Missing `Idempotency-Key` header |
| 422 | `IDEMPOTENCY_KEY_REUSED` | Same key, different request body bytes |
| 422 | `VALIDATION_ERROR` | Field validation failed (see `details.errors`) |
| 404 | `JOB_NOT_FOUND` | Job doesn't exist or you lack access |
| 409 | `JOB_CLOSED` | Job exists but is no longer accepting applications |
| 403 | `ACCESS_REVOKED` | Your access to this company was revoked |
| 409 | `DUPLICATE_SOURCE_APPLICATION_ID` | Same `sourceApplicationId` already submitted |
| 429 | `RATE_LIMITED` | Per-company rate limit exceeded |

#### Idempotency

The `Idempotency-Key` header ensures at-most-once submission. If you retry a request with the **same key AND same request body bytes**, you get the cached 201 response. If you use the same key with **different body bytes**, you get `422 IDEMPOTENCY_KEY_REUSED`.

Keys expire after 24 hours.

::: tip
"Same request body" means identical raw bytes — not semantically equivalent JSON. `{"a":1}` and `{ "a": 1 }` are different bytes and different idempotency signatures.
:::

#### Examples

::: code-group

```bash [curl]
curl -X POST "https://api.employjoy.ai/api/v1/external/applications" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_12345",
    "candidate": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@example.com",
      "phone": "+15551234567"
    },
    "consentToContact": true,
    "source": "indeed",
    "sourceApplicationId": "your-internal-id-123"
  }'
```

```javascript [Node.js]
import { randomUUID } from 'crypto';

const response = await fetch('https://api.employjoy.ai/api/v1/external/applications', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
    'Idempotency-Key': randomUUID(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jobId: 'job_12345',
    candidate: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+15551234567',
    },
    consentToContact: true,
    source: 'indeed',
    sourceApplicationId: 'your-internal-id-123',
  }),
});

const result = await response.json();
console.log(result.id); // "ej_app_789"
```

```python [Python]
import requests
import uuid

response = requests.post(
    'https://api.employjoy.ai/api/v1/external/applications',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Idempotency-Key': str(uuid.uuid4()),
        'Content-Type': 'application/json',
    },
    json={
        'jobId': 'job_12345',
        'candidate': {
            'firstName': 'Jane',
            'lastName': 'Doe',
            'email': 'jane.doe@example.com',
            'phone': '+15551234567',
        },
        'consentToContact': True,
        'source': 'indeed',
        'sourceApplicationId': 'your-internal-id-123',
    },
)
print(response.json()['id'])  # "ej_app_789"
```

:::

---

## Check application status

### `GET /api/v1/external/applications/:id`

#### Response (200 OK)

```json
{
  "id": "ej_app_789",
  "sourceApplicationId": "your-internal-id-123",
  "jobId": "job_12345",
  "status": "in_progress",
  "currentStage": "Video Interview",
  "submittedAt": "2026-05-22T14:30:11Z",
  "lastStatusChangeAt": "2026-05-23T09:14:22Z"
}
```

#### Status values

| Status | Meaning |
|--------|---------|
| `received` | Application submitted, initial outreach pending |
| `in_progress` | Actively being evaluated (video interview, review, etc.) |
| `accepted` | Candidate hired |
| `rejected` | Candidate not selected |

#### Current stage labels

| Label | Internal stage |
|-------|---------------|
| Initial Outreach | Just submitted, pre-SMS |
| Video Interview | Awaiting or in video interview |
| Under Review | Video submitted, scoring in progress |
| Final Review | Rating, committee, or in-person interview |
| Hired | Accepted |
| Closed | Rejected |

---

## List your applications

### `GET /api/v1/external/applications`

Same response shape wrapped in `{ data: [...], next_cursor }`.

#### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `updated_since` | ISO-8601 | Filter by update time |
| `cursor` | string | Opaque pagination cursor |
| `limit` | integer | Default 50, max 200 |
| `company_id` | string | Filter to one company |
| `status` | string | One of: `received`, `in_progress`, `accepted`, `rejected` |

You can only see applications that **your key submitted** (`sourcePartnerId` matches). Read access persists even if company access is later revoked.
