# DevTools Architecture

## Overview

DevTools is a browser-first Next.js 16 application built as a registry-driven suite of developer utilities. The current app exposes five tools:

- UUID generator and validator
- Base64 encoder and decoder
- Hash generator
- Cron expression generator and explainer
- XML formatter, minifier, and XML-to-JSON converter

The architecture is optimized for a small number of stable rules:

1. Keep tool execution inside the browser.
2. Keep route modules thin and mostly static.
3. Make the registry the canonical contract for discovery, ordering, routing, and metadata.
4. Keep validation and transformation logic outside React components.
5. Reuse a shared shell, shared UI primitives, and shared tests when new tools are added.

## Current Product Surface

Primary routes:

- `/` homepage catalog
- `/tools/uuid`
- `/tools/base64`
- `/tools/hash`
- `/tools/cron`
- `/tools/xml`
- `/manifest.webmanifest` via `app/manifest.ts`

Global boundaries and shell-level routes:

- `app/layout.tsx`
- `app/global-error.tsx`
- `app/global-not-found.tsx`
- `app/tools/cron/loading.tsx`

There is no app-managed backend API, route handler, or persistence layer for tool execution.

## Architectural Principles

- Browser-local execution: processors run from client components and use browser APIs or pure library helpers.
- Registry-first composition: tool metadata, navigation, category grouping, keywords, and ordering come from `lib/tools/registry.ts`.
- Thin page modules: each tool route resolves one registry entry, exports metadata, and mounts one client island inside `ToolPageShell`.
- Layered logic: route and UI code stay separate from validation, processors, and utility helpers.
- Shared UX system: consistent shells, buttons, form fields, result panels, status messaging, and tokenized styling are reused across tools.
- Testable seams: validation and processor code can be exercised without full browser navigation, while integration and e2e tests cover the wiring.

## Directory Responsibilities

```text
app/                    Root layout, homepage, per-tool route modules, metadata routes, boundaries
components/marketing/   Homepage hero and registry-backed tool catalog
components/tool-shell/  Shared page shell used by every tool route
components/tools/       Tool-specific client components and shared result presentation
components/ui/          Reusable buttons, fields, icon tiles, and status messaging
lib/tools/              Contracts, registry, metadata helpers, icon map, processors
lib/validation/         Zod schemas, normalization rules, field error helpers
lib/utils/              Clipboard, file, and text utilities
styles/                 Design tokens and global shell styling
tests/                  Unit, integration, and Playwright e2e coverage
openspec/               Archived proposals, designs, tasks, and specs
```

## Rendering and Routing Model

### Root Shell

`app/layout.tsx` defines the document shell, loads `Space Grotesk` and `JetBrains Mono` through `next/font`, imports `styles/globals.css`, and exports site-level metadata and viewport settings from `lib/tools/metadata.ts`.

Supporting shell routes:

- `app/manifest.ts` provides the web app manifest.
- `app/global-error.tsx` is a client boundary with reset and recovery affordances.
- `app/global-not-found.tsx` handles unmatched routes globally.

### Homepage

`app/page.tsx` is a Server Component. It:

- reads the full registry through `getAllTools()`
- derives homepage keywords from tool keywords
- renders `Hero`
- renders `ToolCatalog`

The homepage therefore stays aligned with the registry without hand-maintained tile lists.

### Tool Routes

Each tool page follows the same route pattern:

1. Resolve the tool with `getRequiredToolBySlug('<slug>')`.
2. Export `metadata` via `buildToolMetadata(tool)`.
3. Render `ToolPageShell`.
4. Mount one tool-specific client component.

Examples:

- `app/tools/uuid/page.tsx`
- `app/tools/base64/page.tsx`
- `app/tools/hash/page.tsx`
- `app/tools/cron/page.tsx`
- `app/tools/xml/page.tsx`

The only dedicated route-level loading UI today is `app/tools/cron/loading.tsx`.

## Core Layers

### 1. Registry and Metadata Layer

Located in `lib/tools/`.

Responsibilities:

- define the canonical tool list
- validate tool definition shape with Zod
- normalize `slug`, `id`, and `routePath`
- enforce uniqueness of ids, slugs, and route paths
- expose lookup maps by slug, id, and category
- derive site-wide and per-tool metadata
- map stable icon keys to Lucide icons

Key files:

- `lib/tools/contracts.ts`
- `lib/tools/create-tool-definition.ts`
- `lib/tools/registry.ts`
- `lib/tools/metadata.ts`
- `lib/tools/icon-map.tsx`

Important invariants enforced by code:

- tool ids must be unique
- slugs must be unique
- route paths must be unique
- `supportedActions[].toolId` must match the owning tool id
- route paths must resolve under `/tools/<slug>`

This layer is the main extensibility seam of the application.

### 2. Validation Layer

Located in `lib/validation/`.

Responsibilities:

- normalize user input
- enforce shared text rules and limits
- define tool-specific schemas
- convert Zod issues into `FieldErrors`
- keep validation reusable outside React components

Shared primitives live in `lib/validation/common.ts`.

Key details:

- free-text inputs are capped at `100_000` characters
- validation states are normalized to `idle`, `valid`, `invalid`, and `error`
- XML, cron, UUID, Base64, and hash inputs each have dedicated schemas

### 3. Processing Layer

Located in `lib/tools/processors/`.

Responsibilities:

- perform the actual transformation or generation work
- return typed result objects for the UI
- keep side effects minimal
- separate expected validation failures from unexpected runtime failures

Current execution model by tool:

- UUID: synchronous generation and validation via `uuid`
- Base64: synchronous Unicode-safe encoding and decoding
- Hash: asynchronous hashing because SHA algorithms depend on `crypto.subtle`; MD5 is implemented locally for compatibility
- Cron: synchronous builder and explainer flows with `cronstrue` summaries plus local human-summary heuristics
- XML: synchronous DOM-based parsing, formatting, minifying, and deterministic JSON conversion using `DOMParser` and `XMLSerializer`

### 4. Utility Layer

Located in `lib/utils/`.

Responsibilities:

- clipboard writes with a modern API plus legacy fallback
- line-ending and plain-text normalization
- browser-local file reads and text downloads

Key files:

- `lib/utils/clipboard.ts`
- `lib/utils/file.ts`
- `lib/utils/text.ts`

Notable behavior:

- clipboard writes fall back to `document.execCommand('copy')` when needed
- XML uploads use `File.text()` or `FileReader`
- XML downloads use `Blob` plus `URL.createObjectURL`

### 5. Presentation Layer

Located in `app/` and `components/`.

Responsibilities:

- page composition
- route-level navigation
- responsive layout
- accessibility semantics
- status and feedback rendering
- visual consistency

Key building blocks:

- `components/marketing/hero.tsx`
- `components/marketing/tool-catalog.tsx`
- `components/tool-shell/tool-page-shell.tsx`
- `components/tools/shared/result-panel.tsx`
- `components/ui/button.tsx`
- `components/ui/form-field.tsx`
- `components/ui/icon-tile.tsx`
- `components/ui/status-message.tsx`

## Tool Domains

### UUID

Files:

- `components/tools/uuid/uuid-tool.tsx`
- `lib/validation/uuid.ts`
- `lib/tools/processors/uuid.ts`

Responsibilities:

- generate versions `v1`, `v3`, `v4`, `v5`, and `v7`
- validate pasted UUIDs
- enforce namespace and name inputs for deterministic versions

### Base64

Files:

- `components/tools/base64/base64-tool.tsx`
- `lib/validation/base64.ts`
- `lib/tools/processors/base64.ts`

Responsibilities:

- encode plain text
- decode Base64
- preserve Unicode correctness
- surface malformed input without crashing the workflow

### Hash

Files:

- `components/tools/hash/hash-tool.tsx`
- `lib/validation/hash.ts`
- `lib/tools/processors/hash.ts`

Responsibilities:

- generate `md5`, `sha1`, `sha256`, and `sha512`
- label MD5 and SHA-1 as legacy options
- return lowercase hexadecimal output

### Cron

Files:

- `components/tools/cron/cron-tool.tsx`
- `components/tools/cron/cron-builder.tsx`
- `components/tools/cron/cron-explainer.tsx`
- `components/tools/cron/cron-summary.tsx`
- `components/tools/cron/cron-errors.tsx`
- `lib/validation/cron.ts`
- `lib/tools/processors/cron.ts`

Responsibilities:

- build 5-field and 6-field cron expressions
- explain pasted 5-field and 6-field expressions
- validate field syntax and cross-field conflicts
- produce normalized expressions and readable summaries

The cron page is the only current route with two independent tool workflows living side by side.

### XML

Files:

- `components/tools/xml/xml-tool.tsx`
- `lib/validation/xml.ts`
- `lib/tools/processors/xml.ts`
- `lib/utils/file.ts`

Responsibilities:

- format XML with 2-space, 3-space, or 4-space indentation
- minify valid XML
- convert valid XML into a deterministic JSON structure
- load source XML from local files
- download transformed XML when the current output is XML

The UI keeps the source pane intact and retains the last valid output even when a later transform attempt fails.

## Request and Data Flow

There is no backend request path for tool execution. Runtime flow stays local:

1. A page module resolves a tool definition from the registry.
2. The Server Component route renders `ToolPageShell`.
3. A client tool component owns local form, status, and feedback state.
4. A submit handler calls a processor in `lib/tools/processors/`.
5. The processor validates input with the relevant schema from `lib/validation/`.
6. The processor returns a typed result object with state, message, and optional payload.
7. Shared UI components render output, status, and copy/download affordances.
8. Optional side effects use `lib/utils/clipboard.ts` or `lib/utils/file.ts`.

This keeps React components focused on workflow state and presentation instead of low-level transformation logic.

## Styling System

Styling is split across three layers:

- `styles/tokens.css` for color, spacing, typography, radius, shadow, and focus tokens
- `styles/globals.css` for resets, shell rules, gradients, focus styling, and shared utility classes
- CSS Modules colocated with each component for local layout and component-specific rules

Current visual system characteristics:

- dark, layered surface design with blue, orange, green, and yellow accents
- `Space Grotesk` for display/body text and `JetBrains Mono` for code-like content
- consistent `surface-card` treatment across homepage and tool routes
- explicit focus-visible styling and reduced-motion support

## Testing Architecture

### Unit and Integration

Vitest runs `tests/unit/**/*.test.{ts,tsx}` and `tests/integration/**/*.test.{ts,tsx}` in `jsdom`.

Coverage focuses on:

- processors
- validation rules
- registry invariants
- homepage rendering
- tool component journeys
- tool-shell and catalog wiring

### End-to-End

Playwright covers full route behavior in `tests/e2e/`.

Coverage includes:

- homepage and direct route navigation
- registry-to-route consistency
- axe accessibility smoke checks
- responsive layout assertions for Cron and XML
- performance budgets in CI mode

Important runtime details:

- local runs use `npm run dev`
- CI runs use `npm run build && npm run start`
- Chromium and Firefox are always configured
- WebKit is enabled when `CI=1` or `E2E_WEBKIT=1`

Performance budget coverage currently includes the homepage plus UUID, Base64, Hash, and Cron scenarios. XML has functional e2e coverage but is not yet part of `tests/e2e/performance-budgets.spec.ts`.

## Operational Characteristics

Build and runtime baseline:

- Node.js `20.9+`
- npm `10+`
- `next.config.ts` enables `reactStrictMode`, disables `X-Powered-By`, and opts into `experimental.globalNotFound`

Current non-goals:

- backend APIs or route handlers for tool execution
- databases or persistent storage
- authentication or user accounts
- saved histories or collaboration state
- remote or dynamic tool registration

## Extensibility Workflow

The current architecture scales by preserving the existing seams:

1. Add a `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Reuse an existing icon key and accent token, or extend contracts and `icon-map.tsx`.
3. Add `app/tools/<slug>/page.tsx` and export `buildToolMetadata(tool)`.
4. Add a client component under `components/tools/<slug>/`.
5. Add validation in `lib/validation/<slug>.ts`.
6. Add processing in `lib/tools/processors/<slug>.ts`.
7. Add unit, integration, and e2e coverage.

As long as registry-first discovery, browser-local processing, and validation/processor separation remain intact, the tool suite can grow without changing the core navigation or shell model.
