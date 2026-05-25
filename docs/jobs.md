# Jobs

Discover open positions at companies that have granted your partner key access.

## `GET /api/v1/external/jobs`

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `updated_since` | ISO-8601 | No | Return jobs updated after this timestamp |
| `cursor` | string | No | Opaque cursor from a previous response |
| `limit` | integer | No | Page size. Default 50, max 200 (clamped) |
| `company_id` | string | No | Filter to one company (e.g. `co_67`) |
| `status` | string | No | Only `open` is supported in v1 |

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "job_12345",
      "title": "Janitor",
      "company": {
        "id": "co_67",
        "name": "Acme Cleaning"
      },
      "location": {
        "city": "Tampa",
        "state": "FL",
        "country": "US"
      },
      "compensation": {
        "type": "hourly",
        "min": 18,
        "max": 22,
        "currency": "USD"
      },
      "schedule": "full_time",
      "status": "open",
      "headcount": {
        "total": null,
        "filled": 2
      },
      "createdAt": "2026-05-20T14:00:00Z",
      "updatedAt": "2026-05-22T09:30:00Z",
      "applicationFormSchema": [
        {
          "key": "drivers_license",
          "label": "Do you have a valid driver's license?",
          "type": "boolean",
          "required": true
        }
      ]
    }
  ],
  "next_cursor": "eyJsYXN0VXBkYXRlZEF0IjoiMjAyNi0wNS0yMlQwOTozMDowMFoiLCJsYXN0SWQiOjEyMzQ1fQ=="
}
```

When there are no more pages, `next_cursor` is **absent** (not null).

### Field descriptions

| Field | Description |
|-------|-------------|
| `id` | Stable job identifier (prefix `job_`) |
| `title` | Job title as configured by the employer |
| `company.id` | Company identifier (prefix `co_`) |
| `company.name` | Company display name |
| `location` | City, state, country |
| `compensation` | Pay range. `type` is always `hourly` in v1. `min`/`max` may be null |
| `schedule` | Employment type (e.g. `full_time`, `part_time`, `contract`) — may be null |
| `status` | Always `open` (only visible jobs are returned) |
| `headcount.total` | Target number of hires (null if not set) |
| `headcount.filled` | Current number of hired candidates |
| `applicationFormSchema` | Per-job custom questions. Your `POST /applications` can include answers keyed by these `key` values |
| `createdAt` | When the job was created |
| `updatedAt` | Last modification timestamp |

### Pagination

See [Pagination](/pagination) for full cursor semantics.

### Authorization

Only jobs at companies where your key has active access are returned. Filtering by a `company_id` you don't have access to returns an empty `data` array (no error, no information leakage).

### Examples

::: code-group

```bash [curl]
curl -X GET "https://api.employjoy.ai/api/v1/external/jobs?limit=10&updated_since=2026-05-20T00:00:00Z" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

```javascript [Node.js]
const url = new URL('https://api.employjoy.ai/api/v1/external/jobs');
url.searchParams.set('limit', '10');
url.searchParams.set('updated_since', '2026-05-20T00:00:00Z');

const res = await fetch(url, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY_HERE' },
});
const { data, next_cursor } = await res.json();

// Paginate
if (next_cursor) {
  url.searchParams.set('cursor', next_cursor);
  const nextPage = await fetch(url, {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY_HERE' },
  });
}
```

```python [Python]
import requests

params = {'limit': 10, 'updated_since': '2026-05-20T00:00:00Z'}
headers = {'Authorization': 'Bearer YOUR_API_KEY_HERE'}

response = requests.get(
    'https://api.employjoy.ai/api/v1/external/jobs',
    params=params, headers=headers,
)
result = response.json()
jobs = result['data']

# Paginate
while 'next_cursor' in result:
    params['cursor'] = result['next_cursor']
    response = requests.get(
        'https://api.employjoy.ai/api/v1/external/jobs',
        params=params, headers=headers,
    )
    result = response.json()
    jobs.extend(result['data'])
```

:::
