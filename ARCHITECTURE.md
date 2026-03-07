# DevTools Architecture

## Overview

DevTools is a frontend-only Next.js 16 application built as a catalog of browser-first developer utilities. The current MVP exposes four tools:

- UUID generator and validator
- Base64 encoder and decoder
- Hash generator
- Cron expression generator

The architecture is intentionally optimized for three things:

1. Keep all core tool execution inside the browser.
2. Keep the homepage and route shells lightweight and mostly static.
3. Make new tools plug into a shared registry, visual system, and test strategy without redesigning the app.

## Core Architectural Decisions

The implementation follows the current project direction enforced in the codebase:

- Next.js App Router is the application shell.
- Server Components are the default for layouts, pages, metadata, and marketing/catalog content.
- Client Components are used only where interaction is required.
- There is no app-managed backend API for MVP tool processing.
- Tool discovery is registry-driven, not hard-coded per page.
- Shared UI primitives and design tokens keep tool pages visually and behaviorally consistent.
- Validation and processing are separated from React components so tool logic stays testable.

## Constraints and Invariants

These rules are visible across the codebase and current project conventions:

- All initial tool processing must remain in-browser.
- Anonymous usage only; there are no accounts, persistence layers, or saved sessions.
- The visual system uses IntelliJ IDEA-inspired dark surfaces with orange, green, blue, and yellow accents.
- Desktop and mobile must use the same route model and interaction pattern.
- New tools should be addable without changing the homepage navigation model.
- Accessibility, performance, and copy-feedback states are treated as first-class requirements.

## High-Level Module Layout

```text
app/          App Router entrypoints, layout, metadata, route shells, global boundaries
components/   Reusable UI, catalog/marketing sections, tool shells, tool-specific clients
lib/          Tool registry, contracts, metadata helpers, processors, validation, utilities
styles/       Global styles and design tokens
tests/        Unit, integration, and end-to-end coverage
```

## Contract Surface

The MVP intentionally defines no app-managed HTTP paths for tool execution. That is an architectural boundary, not missing work: request and response shapes may evolve later, but UUID, Base64, Hash, and Cron execution must remain browser-side in the current design.

## Runtime Architecture

### 1. App Shell

`app/layout.tsx` defines the root document structure, loads fonts through `next/font`, applies global styles, and exports site-wide metadata and viewport settings from `lib/tools/metadata.ts`.

This layer is responsible for:

- global HTML structure
- typography setup
- application metadata defaults
- global styling import

### 2. Route Shells

The route layer is simple and mostly static:

- `/` renders the marketing hero plus the registry-backed tool catalog
- `/tools/uuid`
- `/tools/base64`
- `/tools/hash`
- `/tools/cron`

Each tool page follows the same composition pattern:

1. Load the tool definition from `lib/tools/registry.ts`.
2. Derive route metadata with `buildToolMetadata(...)`.
3. Render `ToolPageShell`.
4. Mount exactly one tool-specific interactive client component.

This makes route ownership explicit while keeping most shared concerns out of tool components.

### 3. Client Tool Islands

Interactive behavior lives in client components under `components/tools/**`.

Current client boundaries:

- `components/tools/uuid/uuid-tool.tsx`
- `components/tools/base64/base64-tool.tsx`
- `components/tools/hash/hash-tool.tsx`
- `components/tools/cron/cron-tool.tsx`
- supporting cron and result components

Each tool component owns:

- local form state
- local validation/error display state
- submit handling
- copy-to-clipboard feedback
- mapping processor output into shared result UI

Each tool component does not own:

- catalog registration
- route metadata generation
- global styling
- low-level validation rules
- actual transformation logic

That responsibility stays in `lib/`.

## Layering and Responsibilities

The codebase naturally falls into five layers.

### Presentation Layer

Located in `app/` and `components/`.

Responsibilities:

- page composition
- navigation
- responsive layout
- accessibility semantics
- visual consistency
- status and feedback rendering

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
- validate registry shape
- enforce uniqueness of ids, slugs, and route paths
- derive route metadata and canonical URLs
- map tool icon keys to concrete Lucide icons

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
- convert Zod errors into UI-friendly field error maps
- enforce cross-field rules, especially for cron and UUID namespace/name requirements

Shared validation primitives live in `lib/validation/common.ts`.

Tool-specific validators:

- `uuid.ts`
- `base64.ts`
- `hash.ts`
- `cron.ts`

### Processing Layer

Located in `lib/tools/processors/`.

Responsibilities:

- perform the actual tool operation
- return consistent result objects for the UI
- distinguish `valid`, `invalid`, and `error` states
- keep side effects minimal and browser-local

Current processing strategy by tool:

- UUID: `uuid` package for versions 1, 3, 4, 5, and 7
- Base64: `TextEncoder`, `TextDecoder`, `btoa`, `atob`
- Hash: Web Crypto for SHA algorithms, local MD5 implementation for compatibility
- Cron: join validated fields and summarize using `cronstrue`

### Utility Layer

Located in `lib/utils/`.

Responsibilities:

- clipboard behavior with modern API plus fallback
- text normalization helpers reused by validation

Key files:

- `lib/utils/clipboard.ts`
- `lib/utils/text.ts`

## Domain Model

The app is small, but it already has clear internal domains.

### Domain: Tool Catalog

This domain controls discovery and navigation.

Core concepts:

- `ToolDefinition`
- `ToolActionDefinition`
- homepage tile rendering
- route derivation
- ordering and category grouping

Source of truth:

- `lib/tools/registry.ts`

Consumers:

- homepage catalog
- per-tool route metadata
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

- guide users through six cron fields including seconds
- validate field-level syntax
- validate cross-field conflicts between day-of-month and day-of-week
- produce both expression output and human-readable summary

Main files:

- `components/tools/cron/cron-tool.tsx`
- `components/tools/cron/cron-builder.tsx`
- `components/tools/cron/cron-summary.tsx`
- `components/tools/cron/cron-errors.tsx`
- `lib/validation/cron.ts`
- `lib/tools/processors/cron.ts`

### Domain: Shared UX and Feedback

Responsibilities:

- buttons and field wrappers
- result rendering
- validation and status display
- copy success/failure messaging
- consistent dark-theme styling and focus treatment

Main files:

- `components/ui/**`
- `components/tools/shared/result-panel.tsx`
- `styles/tokens.css`
- `styles/globals.css`

## Request and Data Flow

There is no backend request flow for tool execution. The runtime flow is local:

1. User opens a route rendered by the App Router.
2. The page shell loads a tool definition from the registry.
3. The tool client component renders form controls and local state.
4. On submit, the component calls a processor in `lib/tools/processors/`.
5. The processor validates input through schemas in `lib/validation/`.
6. The processor returns a typed result object.
7. The client component renders shared status/result UI.
8. Optional copy actions go through `lib/utils/clipboard.ts`.

This separation keeps React components thin and makes non-UI behavior testable without browser navigation.

## Extensibility Model

The project is designed around adding more tools without changing the core architecture.

The expected workflow is:

1. Add a new `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Add `app/tools/<slug>/page.tsx`.
3. Add a client component under `components/tools/<slug>/`.
4. Add validation in `lib/validation/`.
5. Add processing in `lib/tools/processors/`.
6. Add unit, integration, and e2e coverage.

Important invariants enforced by code:

- tool ids must be unique
- slugs must be unique
- route paths must be unique
- supported action `toolId` values must match the owning tool
- route metadata falls back safely to `/tools/<slug>`

This means the registry is not just presentation data; it is the app's structural contract for tool discovery and routing.

## Styling Architecture

Styling is split into:

- `styles/tokens.css` for design tokens
- `styles/globals.css` for global resets, shell rules, focus handling, and shared surfaces
- CSS Modules colocated with components for local layout and component styling

Notable styling decisions:

- tokenized IntelliJ-inspired dark palette
- `Space Grotesk` for display/body and `JetBrains Mono` for code-like content
- surface-card pattern reused across marketing and tool screens
- visible focus states and reduced-motion support

## Package and Dependency Roles

### Runtime Dependencies

- `next`, `react`, `react-dom`: application framework and rendering model
- `zod`: runtime contracts for tool definitions and user input
- `uuid`: UUID generation and validation
- `cronstrue`: readable cron summaries
- `lucide-react`: icon system for tiles and status surfaces

### Development and Quality Dependencies

- `typescript`: strict typing across app and tests
- `eslint`, `eslint-config-next`: linting and framework rules
- `vitest`, `jsdom`, `@testing-library/*`, `@vitejs/plugin-react`, `vite-tsconfig-paths`: unit and integration test stack
- `@playwright/test`, `@axe-core/playwright`: end-to-end, accessibility, and performance regression coverage

## Testing Architecture

The test suite mirrors the architectural layers.

### Unit Tests

Located in `tests/unit/`.

Focus:

- processors
- validation rules
- registry invariants
- metadata normalization

These protect the pure logic in `lib/`.

### Integration Tests

Located in `tests/integration/`.

Focus:

- rendered React component journeys
- catalog behavior
- tool interactions without full browser navigation

These validate that UI and processing layers are wired together correctly.

### End-to-End Tests

Located in `tests/e2e/`.

Focus:

- route accessibility
- registry-to-route consistency
- full user flows
- performance budgets

The Playwright layer also includes axe-based accessibility assertions and a production-mode performance budget test as part of the project verification workflow.

## Quality Attributes

The architecture is designed around the project's non-functional targets:

- accessibility: keyboard-only operability, screen-reader-friendly labels and feedback, and dark-theme contrast
- performance: core tool responses within 1 second for normal inputs, with route-level performance budgets validated in Playwright
- consistency: new tools must reuse the same tile, route, metadata, and result patterns
- resilience: invalid inputs should remain visible, with explicit error or empty states instead of crashes

## Operational Characteristics

### Build and Runtime

- Node.js 20.9+ and npm 10+ are the expected runtime/tooling baseline.
- The app is built as a standard Next.js web application.
- MVP routes are intended to stay statically renderable.
- `next.config.ts` keeps `reactStrictMode` enabled and disables `X-Powered-By`.

### Error and Recovery Model

Global failure handling exists through:

- `app/global-error.tsx`
- `app/global-not-found.tsx`
- route-level loading UI for cron via `app/tools/cron/loading.tsx`

Tool-level expected failures are handled inside processors and surfaced as validation or status messages rather than thrown exceptions.

### CI and Quality Gates

GitHub Actions runs:

- lint
- typecheck
- unit/integration tests
- build
- Playwright end-to-end tests

The quality gates align with the project verification workflow.

## Architectural Non-Goals for the Current MVP

The current architecture intentionally does not include:

- backend APIs or route handlers for tool execution
- databases or persistent storage
- authentication or user accounts
- saved histories, shared workspaces, or collaboration state
- dynamic remote tool registration

These omissions are deliberate. They keep the application aligned with the browser-first, fast, anonymous utility model defined for the current MVP.

## Future Evolution Notes

If the project grows, the current architecture is best extended by preserving the same seams:

- keep registry-driven discovery as the catalog source of truth
- keep validation and processing outside React components
- add new client boundaries only where interaction genuinely requires them
- introduce backend capabilities only for features that need secrets, persistence, or external integrations

As long as those rules hold, the current structure can scale from four tools to a larger suite without changing the core navigation or rendering model.


