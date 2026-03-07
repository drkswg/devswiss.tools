# DevTools

DevTools is a frontend-only Next.js application that provides browser-first developer utilities:

- UUID generator and validator (versions 1, 3, 4, 5, 7)
- Base64 encoder and decoder
- Hash generator (MD5, SHA-1, SHA-256, SHA-512)
- Cron expression generator (six fields, includes seconds)

All MVP tool processing runs in the browser with no app-managed backend API.

## Prerequisites

- Node.js 20.9+
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` - homepage catalog
- `/tools/uuid` - UUID generator and validator
- `/tools/base64` - Base64 encoder and decoder
- `/tools/hash` - hash generator
- `/tools/cron` - cron expression generator

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Production-style performance check:

```bash
CI=1 npm run test:e2e -- --project=chromium tests/e2e/performance-budgets.spec.ts
```

Optional WebKit e2e run:

```bash
E2E_WEBKIT=1 npm run test:e2e
```

## Add a new tool

1. Register a new `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Add a route at `app/tools/<slug>/page.tsx` and call `buildToolMetadata(tool)`.
3. Implement processing in `lib/tools/processors/` and validation in `lib/validation/`.
4. Add test coverage in `tests/unit`, `tests/integration`, and `tests/e2e`.
5. Run all quality gates and confirm catalog consistency.

See `lib/tools/README.md` for the detailed add-a-tool workflow.
