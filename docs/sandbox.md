# Sandbox / Test Mode

Test your integration without affecting real candidates or triggering real outreach.

## Test keys

Keys with the `pek_test_` prefix operate in test mode. They hit the same endpoints at the same base URL as production keys.

## Behavior differences

| Feature | Production (`pek_live_*`) | Test (`pek_test_*`) |
|---------|--------------------------|---------------------|
| Application creation | Full pipeline | Flagged `isTestMode` |
| SMS outreach | Sent to real candidate | **Skipped** |
| Video interview email | Sent | **Skipped** |
| AI scoring | Runs | **Skipped** |
| Webhook delivery | Fires | **Fires** (test your handler) |
| Application status | Progresses through pipeline | Stays at "Initial Outreach" |
| Customer visibility | Full | Badged as "TEST" |

## Testing webhooks end-to-end

Test-mode applications DO trigger webhook events. To test `application.status_changed`:

1. Submit a test application via `POST /applications` with your test key
2. Ask your EmployJoy operator to manually advance the test application to "Hired" or "Rejected"
3. Your webhook endpoint receives `application.status_changed` with the status transition

## Test application generator

EmployJoy operators can generate synthetic test applications in bulk using the admin UI. This is useful during initial integration testing — ask your operator to "generate 5 test applications" for your key at a specific company.

## Transitioning to production

When your integration passes testing:
1. Request a production key (`pek_live_*`) from your EmployJoy operator
2. Update your configuration to use the new key
3. Verify with one real submission to confirm end-to-end flow
4. Your test key stays active for future debugging

Both keys can coexist — test keys never interfere with production traffic.
