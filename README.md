# devswiss.tools

devswiss.tools is a browser-first Next.js 16 application that ships a small suite of developer utilities. Tool execution stays in the browser: there is no app-managed backend API for UUID generation, Base64 transforms, hashing, bcrypt password hashing, cron workflows, or XML processing.

## Current Tools

- UUID generator and validator for versions 1, 3, 4, 5, and 7
- Base64 encoder and decoder with Unicode-safe text handling
- Hash generator for MD5, SHA-1, SHA-256, and SHA-512
- Bcrypt hash generator with adjustable rounds, fresh salts, and copy-ready output
- Cron builder and explainer for 5-field and 6-field expressions
- XML formatter, minifier, and XML-to-JSON converter with local file upload and XML download

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5.9
- CSS Modules + shared design tokens
- zod, uuid, bcryptjs, cronstrue, lucide-react
- Vitest + React Testing Library
- Playwright + axe-core

## Prerequisites

- Node.js 20.9+
- npm 10+

## Local Development

Repository convention: use PowerShell for npm commands in this repo. If you depend on workstation-specific wrappers or paths, check `LOCAL.md` when it exists. `LOCAL.md` is local-only and should stay untracked.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` homepage catalog
- `/tools/uuid` UUID generator and validator
- `/tools/base64` Base64 encoder and decoder
- `/tools/hash` hash generator
- `/tools/bcrypt` bcrypt hash generator
- `/tools/cron` cron expression builder and explainer
- `/tools/xml` XML formatter and converter

## Commands

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Production-style performance budget run:

```powershell
$env:CI='1'
npm run test:e2e -- --project=chromium tests/e2e/performance-budgets.spec.ts
```

Optional WebKit e2e run:

```powershell
$env:E2E_WEBKIT='1'
npm run test:e2e
```

## Project Layout

```text
app/                    App Router layout, routes, metadata, and global boundaries
components/marketing/   Homepage hero and tool catalog
components/tool-shell/  Shared tool page shell
components/tools/       Client-side tool workflows
components/ui/          Shared UI primitives
lib/tools/              Registry, contracts, metadata, icon map, processors
lib/validation/         Zod schemas and field error helpers
lib/utils/              Clipboard, file, and text helpers
styles/                 Tokens and global styles
tests/                  Unit, integration, and e2e suites
openspec/               Change proposals, archived tasks, and specs
```

## Architecture Summary

The app is registry-driven. `lib/tools/registry.ts` is the source of truth for tool discovery, ordering, route paths, keywords, and supported actions. Each tool route resolves one registry entry, exports metadata with `buildToolMetadata(tool)`, and renders a shared `ToolPageShell` with consistent catalog and next-tool navigation.

Interactive behavior lives in client components under `components/tools/`. Validation lives in `lib/validation/`, processors live in `lib/tools/processors/`, and browser-specific helpers such as clipboard and local file handling live in `lib/utils/`. This keeps route modules thin and makes the transformation logic easy to test without full browser navigation.

See `ARCHITECTURE.md` for the deeper system breakdown.

## Add a New Tool

1. Add a `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Add `app/tools/<slug>/page.tsx` and export `buildToolMetadata(tool)`.
3. Add a client component under `components/tools/<slug>/`.
4. Add validation in `lib/validation/<slug>.ts`.
5. Add processing in `lib/tools/processors/<slug>.ts`.
6. Add unit, integration, and e2e coverage.
7. Run the quality gates and confirm the new tile appears in the homepage catalog.

See `lib/tools/README.md` for the focused registry workflow.
