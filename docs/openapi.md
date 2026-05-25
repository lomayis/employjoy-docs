# OpenAPI Specification

The EmployJoy Partner API v1 is described by an OpenAPI 3.0 specification that you can import into Postman, Insomnia, or any API development tool.

## Download

[**Download openapi.yaml**](/openapi.yaml)

## Import into Postman

1. Open Postman → **Import** (top-left)
2. Drag the `openapi.yaml` file or paste the URL: `https://docs.employjoy.ai/openapi.yaml`
3. Postman creates a collection with all endpoints pre-configured
4. Set a collection variable `baseUrl` = `https://api.employjoy.ai/api/v1/external`
5. Add your Bearer token to the collection's Authorization tab

## Import into Insomnia

1. Open Insomnia → **File** → **Import**
2. Select `openapi.yaml`
3. All endpoints appear in a new workspace
4. Configure the base environment with your API key

## Endpoints covered

- `GET /jobs` — List available jobs
- `POST /applications` — Submit a candidate
- `GET /applications` — List your applications
- `GET /applications/{id}` — Get application status

## Webhook payloads

The OpenAPI spec includes webhook event schemas for reference. Actual webhook delivery is push-based (we POST to your endpoint) — the spec documents the payload shapes for validation and code generation.
