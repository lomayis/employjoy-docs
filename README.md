# EmployJoy Partner API Docs

Public documentation site for the EmployJoy Partner API v1.

**Live at:** https://docs.employjoy.ai

## Development

```bash
npm install
npm run docs:dev
# → http://localhost:5173
```

## Build

```bash
npm run docs:build
npm run docs:preview  # preview the built site locally
```

## Deploy

Deploys automatically via Vercel on push to `main`.

- Preview: any branch push → Vercel preview URL
- Production: merge to `main` → https://docs.employjoy.ai

## Stack

- [VitePress](https://vitepress.dev) — static site generator
- Vercel — hosting + CDN
- Markdown source — all content in `docs/`

## Content structure

```
docs/
├── index.md           # Landing page
├── getting-started.md # First API call guide
├── authentication.md  # Bearer tokens, rotation
├── jobs.md            # GET /jobs endpoint
├── applications.md    # POST + GET /applications
├── webhooks.md        # Events, HMAC verification
├── errors.md          # Error taxonomy
├── rate-limits.md     # Limits, headers, bootstrap
├── sandbox.md         # Test mode
├── pagination.md      # Cursor semantics
├── openapi.md         # OpenAPI spec page
├── changelog.md       # Release history
└── public/
    ├── openapi.yaml   # Downloadable OpenAPI 3.0
    └── logo.svg       # Site logo
```
