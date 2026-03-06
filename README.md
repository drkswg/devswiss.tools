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

## Run locally (PowerShell)

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

Open `http://localhost:3000`.

## Routes

- `/` - homepage catalog
- `/tools/uuid` - UUID generator and validator
- `/tools/base64` - Base64 encoder and decoder
- `/tools/hash` - hash generator
- `/tools/cron` - cron expression generator

## Commands

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
& 'C:\Program Files\nodejs\npm.cmd' run lint
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
& 'C:\Program Files\nodejs\npm.cmd' run test
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e
```

Production-style performance check:

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
$env:CI='1'
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e -- --project=chromium tests/e2e/performance-budgets.spec.ts
```

Optional WebKit e2e run:

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
$env:E2E_WEBKIT='1'
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e
```

## Add a new tool

1. Register a new `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Add a route at `app/tools/<slug>/page.tsx` and call `buildToolMetadata(tool)`.
3. Implement processing in `lib/tools/processors/` and validation in `lib/validation/`.
4. Add test coverage in `tests/unit`, `tests/integration`, and `tests/e2e`.
5. Run all quality gates and confirm catalog consistency.

See the detailed workflow in [quickstart.md](/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/quickstart.md).
