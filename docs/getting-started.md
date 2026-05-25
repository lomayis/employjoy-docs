# Getting Started

The EmployJoy Partner API lets ATS platforms submit candidates to EmployJoy-managed jobs, track application status, and receive real-time webhook notifications when hiring decisions are made.

## Prerequisites

1. **API key** — issued by an EmployJoy operator. You'll receive a `pek_live_*` key for production and optionally a `pek_test_*` key for sandbox testing.
2. **Webhook endpoint** (optional) — a publicly-reachable HTTPS URL where we'll POST event notifications. Configured at key issuance time.

## Base URL

```
https://api.employjoy.ai/api/v1/external/
```

All endpoints are prefixed with this base URL.

## Your first API call

List available jobs at companies that have granted you access:

::: code-group

```bash [curl]
curl -X GET "https://api.employjoy.ai/api/v1/external/jobs" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

```javascript [Node.js]
const response = await fetch('https://api.employjoy.ai/api/v1/external/jobs', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY_HERE' },
});
const { data, next_cursor } = await response.json();
console.log(`Found ${data.length} jobs`);
```

```python [Python]
import requests

response = requests.get(
    'https://api.employjoy.ai/api/v1/external/jobs',
    headers={'Authorization': 'Bearer YOUR_API_KEY_HERE'},
)
data = response.json()
print(f"Found {len(data['data'])} jobs")
```

:::

## Expected response

```json
{
  "data": [
    {
      "id": "job_12345",
      "title": "Janitor",
      "company": { "id": "co_67", "name": "Acme Cleaning" },
      "location": { "city": "Tampa", "state": "FL", "country": "US" },
      "compensation": { "type": "hourly", "min": 18, "max": 22, "currency": "USD" },
      "schedule": "full_time",
      "status": "open",
      "headcount": { "total": null, "filled": 2 },
      "createdAt": "2026-05-20T14:00:00Z",
      "updatedAt": "2026-05-22T09:30:00Z",
      "applicationFormSchema": [
        { "key": "drivers_license", "label": "Do you have a valid driver's license?", "type": "boolean", "required": true }
      ]
    }
  ],
  "next_cursor": "eyJsYXN0VXBkYXRlZEF0IjoiMjAyNi..."
}
```

## Next steps

1. **[Submit an application](/applications)** — POST a candidate to a job
2. **[Set up webhooks](/webhooks)** — receive real-time hiring decisions
3. **[Explore authentication](/authentication)** — key lifecycle, rotation, best practices
