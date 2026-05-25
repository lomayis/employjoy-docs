# Changelog

## v1 — 2026

**Initial release** of the EmployJoy Partner API.

### Endpoints
- `GET /api/v1/external/jobs` — Discover open positions
- `POST /api/v1/external/applications` — Submit candidates
- `GET /api/v1/external/applications/:id` — Check application status
- `GET /api/v1/external/applications` — List submitted applications

### Webhooks
- `application.status_changed` — Terminal hiring decisions
- `job.opened` — New positions available
- `job.closed` — Positions no longer available

### Features
- Bearer token authentication with key rotation
- HMAC-SHA256 signed webhooks with 5-minute replay protection
- Cursor-based pagination
- Idempotency-safe application submission
- Per-endpoint scoped rate limits
- Test mode with `pek_test_*` keys

---

*Future changes will be documented here with dates, descriptions, and any migration guidance.*
