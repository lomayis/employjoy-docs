# Pagination

All list endpoints use **cursor-based pagination** (not offset-based). This ensures stable results under concurrent writes.

## How it works

1. Make your initial request (optionally with `updated_since` and `limit`)
2. If `next_cursor` is present in the response, more pages exist
3. Pass `next_cursor` as the `?cursor=` query parameter on your next request
4. Repeat until `next_cursor` is absent

## Parameters

| Parameter | Description |
|-----------|-------------|
| `updated_since` | ISO-8601 timestamp. Returns only records updated after this time |
| `cursor` | Opaque string from a previous response's `next_cursor` |
| `limit` | Page size. Default 50, max 200. Values above 200 are clamped (not errored) |

## Important

::: warning
The cursor is **opaque**. Do not parse, decode, or modify it. The internal format may change without notice. Always use the exact string from `next_cursor`.
:::

## End of results

When there are no more pages, `next_cursor` is **absent from the response** (not null, not empty string — absent entirely).

```json
{
  "data": [ ... ],
  "next_cursor": "eyJsYXN0VXBkYXRlZEF0Ijo..."
}
```

vs. final page:

```json
{
  "data": [ ... ]
}
```

## Full pagination loop

::: code-group

```javascript [Node.js]
async function fetchAll(endpoint, headers) {
  const results = [];
  let cursor = null;

  while (true) {
    const url = new URL(`https://api.employjoy.ai/api/v1/external/${endpoint}`);
    url.searchParams.set('limit', '200');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url, { headers });
    const { data, next_cursor } = await res.json();
    results.push(...data);

    if (!next_cursor) break;
    cursor = next_cursor;
  }

  return results;
}

const allJobs = await fetchAll('jobs', {
  'Authorization': 'Bearer YOUR_API_KEY_HERE',
});
```

```python [Python]
import requests

def fetch_all(endpoint, headers):
    results = []
    params = {'limit': 200}

    while True:
        response = requests.get(
            f'https://api.employjoy.ai/api/v1/external/{endpoint}',
            params=params, headers=headers,
        )
        data = response.json()
        results.extend(data['data'])

        if 'next_cursor' not in data:
            break
        params['cursor'] = data['next_cursor']

    return results

all_jobs = fetch_all('jobs', {
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
})
```

:::
