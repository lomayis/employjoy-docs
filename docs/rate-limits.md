# Rate Limits

Rate limits protect the system from runaway integrations. Limits are scoped per-partner or per-(partner, company) depending on the endpoint.

## Per-endpoint limits

| Endpoint | Limit | Bucket |
|----------|-------|--------|
| `POST /applications` | 10/min | Per (partner key, company) |
| `GET /applications/:id` | 120/min | Per partner key |
| `GET /applications` | 60/min | Per partner key |
| `GET /jobs` | 60/min | Per partner key |

## Response headers

Every response includes rate-limit headers (not just 429):

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1716393600
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests allowed in the current window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

## 429 response

```json
{
  "error": "RATE_LIMITED",
  "message": "Rate limit exceeded for company co_67.",
  "scope": "partner_company",
  "companyId": "co_67",
  "retryAfter": 18
}
```

The `Retry-After` response header is also set (seconds).

`scope` tells you which bucket tripped:
- `partner_company` — back off for that one company's pipeline
- `partner` — back off across all requests

## Bootstrap mode

For initial bulk migrations (e.g., backfilling 100+ existing candidates when a customer first grants access), an EmployJoy operator can enable **bootstrap mode** on your company access record. This multiplies the POST limit by 5x (50/min) for 24 hours.

Bootstrap mode is admin-activated — contact your EmployJoy operator when you need a bulk push. It expires automatically after 24 hours.

## Handling rate limits

1. Check `X-RateLimit-Remaining` before sending — if 0, wait for reset
2. On 429: read `Retry-After` header, sleep that many seconds, then retry
3. For POST: per-company bucket means other companies are unaffected — only back off for the tripped company
4. Don't retry in a tight loop — exponential backoff with jitter if `Retry-After` is missing
