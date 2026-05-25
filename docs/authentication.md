# Authentication

Every request to the Partner API requires a Bearer token in the `Authorization` header.

## Header format

```
Authorization: Bearer pek_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345
```

## Key prefixes

| Prefix | Environment | Behavior |
|--------|-------------|----------|
| `pek_live_` | Production | Real candidates enter the hiring pipeline |
| `pek_test_` | Sandbox | Applications are flagged `isTestMode` — no SMS, no AI scoring, no video interviews |

Both key types hit the same endpoints at the same base URL. The difference is entirely in downstream processing.

## Key lifecycle

```
┌────────┐    rotate    ┌──────────┐    grace expires    ┌─────────┐
│ active │───────────→│ rotating │─────────────────→│ revoked │
└────────┘              └──────────┘                      └─────────┘
     │                                                         ▲
     │         revoke / suspend                                │
     └────────────────────────────────────────────────────────┘
```

### Active

Standard operating state. All API calls succeed.

### Rotating

Your key has been rotated. A new key was issued; this (old) key still works during a **7-day grace period**. Responses include a `Sunset` header with the grace expiry timestamp:

```
Sunset: Sat, 31 May 2026 14:00:00 GMT
```

**Action:** Switch to the new key before the Sunset date. After expiry, the old key returns 401.

### Revoked / Suspended

The key no longer authenticates. All requests return:

```json
{
  "error": "UNAUTHORIZED",
  "message": "API key is revoked."
}
```

**Revoked** is permanent. **Suspended** is a reversible hold (billing dispute, compliance investigation) — an operator can unsuspend it.

## Error responses

| Status | Error code | Meaning |
|--------|-----------|---------|
| 401 | `UNAUTHORIZED` | Missing header, invalid key, revoked key, or expired rotation grace |

## Best practices

1. **Store your key in an environment variable** — never hardcode in source.
2. **Handle 401 gracefully** — log, alert your team, stop retrying until the key is replaced.
3. **Watch for the `Sunset` header** — if present, your key is being rotated. Switch to the new key before the date.
4. **Rotate proactively** — contact EmployJoy to rotate before a key is compromised, not after.
