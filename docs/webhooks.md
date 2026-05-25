# Webhooks

Real-time HTTPS notifications when application status changes or job visibility changes. HMAC-signed for authenticity verification.

## Event types

| Event | Fires when |
|-------|-----------|
| `application.status_changed` | Application reaches a terminal state (`accepted` or `rejected`) |
| `job.opened` | A job becomes visible to your key (new job, access granted, un-archived) |
| `job.closed` | A job stops being visible (closed, access revoked, marked internal-only) |

::: tip
`application.status_changed` fires **only** on terminal transitions. Intermediate progress (received → in_progress) does NOT fire a webhook. Use `GET /applications/:id` or `GET /applications` for intermediate status polling.
:::

## Payload envelope

All events share the same outer shape:

```json
{
  "id": "evt_2026052214301198abc",
  "type": "application.status_changed",
  "createdAt": "2026-05-22T14:30:11Z",
  "apiVersion": "v1",
  "data": { }
}
```

| Field | Description |
|-------|-------------|
| `id` | Globally unique event identifier. **Stable across retries** — use it to deduplicate |
| `type` | One of the three event types above |
| `createdAt` | When the event occurred (not when it was delivered) |
| `apiVersion` | Always `v1` |
| `data` | Event-specific payload (see below) |

## Event payloads

### `application.status_changed`

```json
{
  "applicationId": "ej_app_789",
  "sourceApplicationId": "your-internal-id-123",
  "jobId": "job_12345",
  "oldStatus": "in_progress",
  "newStatus": "accepted",
  "currentStage": "Hired",
  "occurredAt": "2026-05-29T11:42:00Z"
}
```

### `job.opened`

```json
{
  "jobId": "job_12345",
  "companyId": "co_67",
  "title": "Janitor",
  "openedAt": "2026-05-20T14:00:00Z"
}
```

### `job.closed`

```json
{
  "jobId": "job_12345",
  "companyId": "co_67",
  "reason": "closed_by_customer",
  "closedAt": "2026-06-14T16:20:00Z"
}
```

`reason` values: `closed_by_customer` | `access_revoked` | `internal_sourcing_only`

## Signature verification

Every webhook request includes two headers:

```
X-EmployJoy-Signature: t=1716393611,v1=d7b4ed92ded8c3629bad3c1ef456e80e0e7dd4681675693b1684575562da6a12
X-EmployJoy-Timestamp: 1716393611
```

### Verification algorithm

1. Extract `t` (timestamp) and `v1` (signature) from the `X-EmployJoy-Signature` header
2. Construct the signing input: `${t}.${raw_request_body}` (literal dot separator, raw bytes)
3. Compute HMAC-SHA256 of the signing input using your signing secret as the key
4. Compare the computed hex digest with `v1` using **constant-time comparison**
5. Verify the timestamp is within **5 minutes** of your server's current time (replay protection)

::: warning
The signing input uses the **raw request body bytes** — not parsed/re-serialized JSON. Do not JSON.parse then JSON.stringify the body before verification. Use the raw bytes your HTTP framework received.
:::

### Test vector

Use this to validate your verification implementation:

```
Secret:    whsec_test_abcdef1234567890
Body:      {"id":"evt_test","type":"application.status_changed","data":{}}
Timestamp: 1716393611
Expected:  d7b4ed92ded8c3629bad3c1ef456e80e0e7dd4681675693b1684575562da6a12
```

### Node.js verification example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(req, signingSecret) {
  const signatureHeader = req.headers['x-employjoy-signature'];
  if (!signatureHeader) return false;

  // Parse t= and v1= from header
  const parts = {};
  for (const segment of signatureHeader.split(',')) {
    const [key, value] = segment.split('=', 2);
    parts[key.trim()] = value;
  }
  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  // Replay window: reject if older than 5 minutes
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (age > 300) return false;

  // Compute expected signature from raw body
  const signingInput = `${timestamp}.${req.rawBody}`;
  const expected = crypto
    .createHmac('sha256', signingSecret)
    .update(signingInput)
    .digest('hex');

  // Constant-time comparison
  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(signature, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

// Express example:
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  req.rawBody = req.body.toString('utf8');
  if (!verifyWebhookSignature(req, process.env.EMPLOYJOY_SIGNING_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.rawBody);
  // Process event...
  res.status(200).json({ received: true });
});
```

### Python verification example

```python
import hmac
import hashlib
import time

def verify_webhook_signature(body: bytes, signature_header: str, signing_secret: str) -> bool:
    """Verify an EmployJoy webhook signature.

    Args:
        body: Raw request body bytes (not decoded/re-encoded)
        signature_header: Value of X-EmployJoy-Signature header
        signing_secret: Your signing secret (starts with wsec_)
    """
    # Parse t= and v1= from header
    parts = {}
    for segment in signature_header.split(','):
        key, _, value = segment.partition('=')
        parts[key.strip()] = value

    timestamp = parts.get('t')
    signature = parts.get('v1')
    if not timestamp or not signature:
        return False

    # Replay window: reject if older than 5 minutes
    age = abs(int(time.time()) - int(timestamp))
    if age > 300:
        return False

    # Compute expected signature from raw body
    signing_input = f"{timestamp}.".encode('utf-8') + body
    expected = hmac.new(
        signing_secret.encode('utf-8'),
        signing_input,
        hashlib.sha256,
    ).hexdigest()

    # Constant-time comparison
    return hmac.compare_digest(expected, signature)


# Flask example:
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    body = request.get_data()  # raw bytes
    sig_header = request.headers.get('X-EmployJoy-Signature', '')

    if not verify_webhook_signature(body, sig_header, os.environ['EMPLOYJOY_SIGNING_SECRET']):
        return 'Invalid signature', 401

    event = json.loads(body)
    # Process event...
    return {'received': True}, 200
```

## Retry schedule

If your endpoint returns a non-2xx response, we retry with exponential backoff:

| Attempt | Delay from previous |
|---------|-------------------|
| 1 | Immediate |
| 2 | ~1 minute |
| 3 | ~5 minutes |
| 4 | ~30 minutes |
| 5 | ~2 hours |
| 6 | ~6 hours |
| 7 | ~12 hours |
| 8 | ~24 hours |
| 9 | ~24 hours |
| 10 | ~24 hours |

After 10 attempts (~3 days), the delivery is moved to dead-letter and an EmployJoy operator is alerted.

Delays include ±25% jitter to avoid thundering-herd on recovery.

## Auto-pause

Your webhook endpoint is automatically paused when:
- **50 consecutive failures**, OR
- **24 hours** since the last successful delivery

When paused, new events are still recorded but not delivered. Contact partnerships@employjoy.ai to re-enable after fixing your endpoint.

## 410 Gone

If your endpoint returns HTTP `410 Gone`, we immediately pause delivery and alert an operator. Use this to signal that your endpoint has been permanently decommissioned.

## Deduplication

The `id` field in every webhook payload is stable across retries. If you receive the same `id` twice, it's a retry — safe to skip if you've already processed it.

## Best practices

1. **Respond 2xx quickly** — acknowledge receipt, then process asynchronously. We timeout at 30 seconds.
2. **Verify the signature first** — before parsing the body or taking any action.
3. **Use the `id` field for deduplication** — retries reuse the same event ID.
4. **Don't rely solely on webhooks** — they're best-effort hints. Poll `GET /applications` as the source of truth.
5. **Return 410** if you decommission your endpoint — we'll stop retrying immediately.
