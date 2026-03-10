# DevTools Architecture

## Overview

DevTools is a browser-first Next.js 16 application built as a registry-driven catalog of developer utilities. The current app exposes four tools:

- UUID generator and validator
- Base64 encoder and decoder
- Hash generator
- Cron builder and explainer

The architecture is optimized for three things:

1. Keep tool execution inside the browser.
2. Keep route modules thin and mostly static.
3. Let new tools plug into a shared registry, visual system, and test strategy without redesigning the app shell.

## Core Architectural Decisions

The current implementation follows these code-level decisions:

- Next.js App Router provides the application shell.
- Server Components are the default for layout, page composition, metadata, and catalog content.
- Client Components are used only for interactive tool workflows and global error recovery.
- There is no app-managed backend API or route handler for tool execution.
- `lib/tools/registry.ts` is the source of truth for discovery, route lookup, category metadata, and test consistency checks.
- Validation and processing live in `lib/`, outside React components.
- Shared UI primitives and design tokens keep tool pages structurally consistent while allowing tool-specific behavior.

## Constraints and Invariants

These constraints are visible in the current codebase:

- Tool input and output processing must remain browser-local.
- Anonymous usage only; there are no accounts, persistence layers, or saved sessions.
- Free-text tool inputs are capped at `100_000` characters.
- Tool definitions are validated with Zod and must keep unique ids, slugs, and route paths.
- Supported action `toolId` values must match the owning tool definition.
- Cron workflows currently support exactly 5-field and 6-field expressions.
- Accessibility, performance, and copy-feedback behavior are treated as first-class requirements.

## High-Level Module Layout

```text
app/          App Router entrypoints, metadata routes, route shells, global boundaries
components/   Marketing sections, tool shells, shared UI primitives, tool-specific clients
lib/          Tool registry, contracts, metadata helpers, processors, validation, utilities
styles/       Global styles and design tokens
tests/        Unit, integration, and end-to-end coverage
openspec/     Change proposals, archived designs, and spec artifacts
```

## Route and Contract Surface

The app intentionally defines no HTTP contract for tool execution. Tool processors are invoked only from client-side React components.

Current route surface:

- `/` for the catalog landing page
- `/tools/uuid`
- `/tools/base64`
- `/tools/hash`
- `/tools/cron`
- `/manifest.webmanifest` via `app/manifest.ts`

Global boundaries are also part of the route shell:

- `app/global-error.tsx`
- `app/global-not-found.tsx`

## Runtime Architecture

### 1. App Shell

`app/layout.tsx` defines the root document, loads `Space Grotesk` and `JetBrains Mono` through `next/font`, imports global styles, and exports site-wide metadata and viewport settings from `lib/tools/metadata.ts`.

Supporting shell-level routes and boundaries:

- `app/manifest.ts` provides the web app manifest.
- `app/global-error.tsx` provides reset and recovery UI for unhandled render failures.
- `app/global-not-found.tsx` handles unmatched routes.

### 2. Registry-Backed Route Shells

The route layer is intentionally thin:

- `/` renders `Hero` plus `ToolCatalog`, both backed by `getAllTools()`.
- each `/tools/<slug>` page imports one registry definition with `getRequiredToolBySlug(...)`
- each tool page exports `buildToolMetadata(tool)`
- each tool page renders `ToolPageShell` and mounts one tool-specific client island

The homepage also derives metadata keywords from registry keywords, so catalog copy and metadata stay aligned.

### 3. Client Tool Islands

Interactive behavior lives under `components/tools/**`.

Current client boundaries:

- `components/tools/uuid/uuid-tool.tsx`
- `components/tools/base64/base64-tool.tsx`
- `components/tools/hash/hash-tool.tsx`
- `components/tools/cron/cron-tool.tsx`
- supporting cron and shared result components

Each tool component owns:

- local form state
- local validation and status state
- submit handling
- copy-to-clipboard feedback
- mapping processor output into shared UI panels

Each tool component does not own:

- catalog registration
- route metadata generation
- low-level validation rules
- transformation logic
- clipboard implementation details

That behavior stays in `lib/`.

### 4. Execution Model by Tool

- UUID and Base64 use synchronous submit flows.
- Hash uses an async submit flow because SHA variants depend on `crypto.subtle`.
- Cron contains two independent client workflows in one route: a guided builder and a pasted-expression explainer.

## Layering and Responsibilities

The codebase falls into five main layers.

### Presentation Layer

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
- `components/ui/button.tsx`
- `components/ui/form-field.tsx`
- `components/ui/icon-tile.tsx`
- `components/ui/status-message.tsx`
- `components/tools/shared/result-panel.tsx`

### Registry and Metadata Layer

Located in `lib/tools/`.

Responsibilities:

- define the canonical list of tools
- validate tool definition shape
- enforce uniqueness of ids, slugs, and route paths
- derive canonical route paths and metadata
- maintain lookup maps by slug, id, and category
- map icon keys to Lucide icons

Key files:

- `lib/tools/contracts.ts`
- `lib/tools/create-tool-definition.ts`
- `lib/tools/registry.ts`
- `lib/tools/metadata.ts`
- `lib/tools/icon-map.tsx`

This is the main extensibility seam of the application.

### Validation Layer

Located in `lib/validation/`.

Responsibilities:

- define each tool's accepted input shape
- normalize and validate input values
- convert Zod issues into UI-friendly `FieldErrors`
- enforce tool-specific rules such as UUID namespace/name requirements and cron field conflicts
- enforce shared input size limits for free-text tools

Shared primitives live in `lib/validation/common.ts`.

Tool-specific validators:

- `uuid.ts`
- `base64.ts`
- `hash.ts`
- `cron.ts`

### Processing Layer

Located in `lib/tools/processors/`.

Responsibilities:

- perform the actual tool operation
- return typed result objects for the UI
- distinguish `valid`, `invalid`, and `error` states
- keep processing browser-local and side effects minimal

Current processing strategy by tool:

- UUID: `uuid` package for versions 1, 3, 4, 5, and 7
- Base64: `TextEncoder`, `TextDecoder`, `btoa`, and `atob`
- Hash: `crypto.subtle` for SHA algorithms plus a local MD5 implementation for compatibility
- Cron: validated field assembly or expression parsing, then human summary generation through `cronstrue` plus local summary heuristics

### Utility Layer

Located in `lib/utils/`.

Responsibilities:

- clipboard behavior with modern API plus fallback
- shared text normalization and blank checks
- small text helpers reused by validation and presentation

Key files:

- `lib/utils/clipboard.ts`
- `lib/utils/text.ts`

## Domain Model

The app is small, but the code already has clear internal domains.

### Domain: Tool Catalog

This domain controls discovery and navigation.

Core concepts:

- `ToolDefinition`
- `ToolActionDefinition`
- homepage tile rendering
- route derivation
- ordering and category metadata

Source of truth:

- `lib/tools/registry.ts`

Consumers:

- homepage catalog
- per-tool page modules
- metadata generation
- tests that assert registry consistency

### Domain: UUID

Responsibilities:

- generate versions `v1`, `v3`, `v4`, `v5`, `v7`
- validate pasted UUIDs
- enforce namespace and name requirements for deterministic versions

Main files:

- `components/tools/uuid/uuid-tool.tsx`
- `lib/validation/uuid.ts`
- `lib/tools/processors/uuid.ts`

### Domain: Base64

Responsibilities:

- encode plain text
- decode Base64
- preserve Unicode correctness
- keep malformed input visible while returning actionable errors

Main files:

- `components/tools/base64/base64-tool.tsx`
- `lib/validation/base64.ts`
- `lib/tools/processors/base64.ts`

### Domain: Hashing

Responsibilities:

- generate `md5`, `sha1`, `sha256`, `sha512`
- label MD5 and SHA-1 as legacy
- return lowercase hexadecimal output

Main files:

- `components/tools/hash/hash-tool.tsx`
- `lib/validation/hash.ts`
- `lib/tools/processors/hash.ts`

### Domain: Cron Scheduling

Responsibilities:

- build 5-field or 6-field cron expressions from guided selections
- explain pasted 5-field or 6-field expressions
- validate field syntax and cross-field conflicts
- produce normalized expressions plus human-readable summaries

Main files:

- `components/tools/cron/cron-tool.tsx`
- `components/tools/cron/cron-builder.tsx`
- `components/tools/cron/cron-explainer.tsx`
- `components/tools/cron/cron-summary.tsx`
- `components/tools/cron/cron-errors.tsx`
- `lib/validation/cron.ts`
- `lib/tools/processors/cron.ts`

### Domain: Shared UX and Feedback

Responsibilities:

- buttons and field wrappers
- result rendering
- validation and status display
- copy success and failure messaging
- consistent dark-surface styling and focus treatment

Main files:

- `components/ui/**`
- `components/tools/shared/result-panel.tsx`
- `styles/tokens.css`
- `styles/globals.css`

## Request and Data Flow

There is no backend request flow for tool execution. Runtime data flow stays local:

1. A page module resolves a tool definition from the registry.
2. The server-rendered page shell mounts the tool's client component.
3. The client component collects local form state.
4. A submit handler calls a processor in `lib/tools/processors/`.
5. The processor validates input through schemas in `lib/validation/`.
6. The processor returns a typed result object with `message`, `state`, and optional payload fields.
7. Shared presentation components render status, output, and copy feedback.
8. Optional copy actions go through `lib/utils/clipboard.ts`.

This separation keeps React components thin and makes non-UI behavior testable without full browser navigation.

## Extensibility Model

The project is designed to add more tools without changing the shell architecture.

Expected workflow:

1. Add a new `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Choose an existing `iconKey` and accent token, or extend the tool contracts and icon map if needed.
3. Add `app/tools/<slug>/page.tsx` and call `buildToolMetadata(tool)`.
4. Add a client component under `components/tools/<slug>/`.
5. Add validation in `lib/validation/`.
6. Add processing in `lib/tools/processors/`.
7. Add unit, integration, and e2e coverage.

Important invariants enforced by code:

- tool ids must be unique
- slugs must be unique
- route paths must be unique
- supported action `toolId` values must match the owning tool
- route metadata falls back safely to `/tools/<slug>`

The registry is therefore not just presentation data; it is the structural contract for tool discovery and routing.

## Styling Architecture

Styling is split across three levels:

- `styles/tokens.css` for color, spacing, radius, shadow, and font tokens
- `styles/globals.css` for resets, shell rules, background gradients, focus handling, and shared surfaces
- CSS Modules colocated with components for local layout and component styling

Notable styling choices in the current code:

- a dark surface system with orange, green, blue, and yellow accents
- `Space Grotesk` for display and body text, `JetBrains Mono` for code-like content
- the reusable `surface-card` pattern across marketing and tool screens
- visible focus states and reduced-motion support

## Package and Dependency Roles

### Runtime Dependencies

- `next`, `react`, `react-dom`: application framework and rendering model
- `zod`: runtime contracts for tool definitions and user input
- `uuid`: UUID generation and validation
- `cronstrue`: readable cron summaries
- `lucide-react`: icon system for tiles, buttons, and status UI

### Development and Quality Dependencies

- `typescript`: strict typing across app and tests
- `eslint`, `eslint-config-next`: linting and framework rules
- `vitest`, `jsdom`, `@testing-library/*`, `@vitejs/plugin-react`, `vite-tsconfig-paths`: unit and integration test stack
- `@playwright/test`, `@axe-core/playwright`: end-to-end, accessibility, and performance regression coverage

## Testing Architecture

The test suite mirrors the architectural layers.

### Unit and Integration Tests

Vitest runs both `tests/unit/**/*.test.{ts,tsx}` and `tests/integration/**/*.test.{ts,tsx}` in `jsdom`.

Focus:

- processors
- validation rules
- registry invariants
- rendered React tool journeys
- homepage catalog behavior

These tests protect the pure logic in `lib/` and the wiring between client components and shared UI.

### End-to-End Tests

Playwright covers full route behavior in `tests/e2e/`.

Focus:

- homepage and tool-route happy paths
- registry-to-route consistency
- accessibility smoke checks with axe
- responsive cron layout behavior
- performance budgets

Project coverage is currently:

- Chromium and Firefox by default
- WebKit when `CI=1` or `E2E_WEBKIT=1`
- local `npm run dev` server in normal runs
- `npm run build && npm run start` when `CI=1`

The performance budgets suite runs only in CI mode and only on Chromium.

## Quality Attributes

The current architecture is designed around these non-functional targets:

- accessibility: keyboard operability, screen-reader-friendly labels, and explicit status messaging
- performance: fast local processing and route-level performance budget checks
- consistency: new tools reuse the same tile, route, metadata, and result patterns
- resilience: invalid inputs remain visible and are surfaced as actionable states instead of crashes

## Operational Characteristics

### Build and Runtime

- Node.js 20.9+ and npm 10+ are the baseline.
- `next.config.ts` enables `reactStrictMode`, disables `X-Powered-By`, and turns on experimental `globalNotFound`.
- Current routes do not depend on remote data fetching, accounts, or persisted server-side state.

### Error and Recovery Model

Global failure handling exists through:

- `app/global-error.tsx`
- `app/global-not-found.tsx`
- route-level loading UI for cron via `app/tools/cron/loading.tsx`

Expected tool failures are handled inside processors and surfaced as validation or status messages rather than uncaught exceptions.

### Quality Gates

Repository scripts expose the current verification workflow:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

Playwright automatically tightens retries and switches to production-server mode when `CI=1`.

## Architectural Non-Goals for the Current MVP

The current architecture intentionally does not include:

- backend APIs or route handlers for tool execution
- databases or persistent storage
- authentication or user accounts
- saved histories, shared workspaces, or collaboration state
- dynamic remote tool registration

These omissions keep the application aligned with the browser-first, fast, anonymous utility model.

## Future Evolution Notes

If the project grows, the current architecture is best extended by preserving the same seams:

- keep registry-driven discovery as the catalog source of truth
- keep validation and processing outside React components
- add new client boundaries only where interaction genuinely requires them
- introduce backend capabilities only for features that need secrets, persistence, or external integrations

As long as those rules hold, the structure can scale from the current four tools to a larger suite without changing the core navigation model.


