# devswiss.tools Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-11

## Active Technologies

- TypeScript 5.9 on Node.js 20.9+ + Next.js 16 App Router, React 19, next/font, CSS Modules, CSS custom properties
- Runtime libraries: bcryptjs, lucide-react, uuid, cronstrue, zod
- Browser APIs: Web Crypto, DOMParser/XMLSerializer, Clipboard API with legacy fallback, File/FileReader, Blob object URLs
- Test stack: Vitest, React Testing Library, Playwright, @axe-core/playwright

## Current App Surface

- `/` registry-driven catalog landing page with `Hero` and `ToolCatalog`
- `/tools/uuid` UUID generate/validate workflow for versions 1, 3, 4, 5, and 7
- `/tools/base64` Base64 encode/decode workflow with Unicode-safe text handling
- `/tools/hash` browser-side hash generator for MD5, SHA-1, SHA-256, and SHA-512
- `/tools/bcrypt` bcrypt hash generator with adjustable rounds from 1 through 20, fresh salts, and copy-ready output
- `/tools/cron` combined cron builder and cron explainer for 5-field and 6-field expressions
- `/tools/xml` two-pane XML formatter, minifier, XML-to-JSON converter, and local file import/export workflow
- Shell boundaries: `app/global-error.tsx`, `app/global-not-found.tsx`, `app/tools/cron/loading.tsx`, `app/manifest.ts`

## Project Structure

```text
app/                    App Router layout, route modules, metadata routes, global boundaries
components/marketing/   Homepage hero and registry-backed catalog UI
components/tool-shell/  Shared tool page header and content shell
components/tools/       Client tool islands plus shared result components
components/ui/          Reusable buttons, form fields, icon tiles, status messaging
lib/tools/              Tool contracts, registry, metadata helpers, icon map, processors
lib/validation/         Zod schemas, input normalization, field error formatting
lib/utils/              Clipboard, file, and text helpers
styles/                 Global styling and design tokens
tests/                  Unit, integration, and Playwright end-to-end coverage
openspec/               Spec artifacts, proposals, and archived changes
```

## Commands

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- `$env:CI='1'; npm run test:e2e -- --project=chromium tests/e2e/performance-budgets.spec.ts`
- `$env:E2E_WEBKIT='1'; npm run test:e2e`

## Code Style

- Server Components are the default for layout, route composition, and metadata.
- Interactive workflows live in `use client` tool components and call processors in `lib/tools/processors/`.
- Keep route modules thin: resolve the registry entry with `getRequiredToolBySlug(...)`, export `buildToolMetadata(tool)`, and render `ToolPageShell`.
- The tool registry is the source of truth for ordering, category labels, route paths, supported actions, keywords, and copy support.
- Put validation in `lib/validation/` and transformation logic in `lib/tools/processors/`; tool execution must stay browser-local.
- Shared UX goes through the existing UI primitives, result/status components, and tokenized styling system before introducing new patterns.
- Free-text inputs are capped at `100_000` characters through shared validation primitives.
- Favor explicit `valid`, `invalid`, and `error` states with actionable field-level feedback over implicit failures.

## Testing Expectations

- `tests/unit/` covers registry invariants, validation schemas, and processor logic.
- `tests/integration/` covers homepage rendering, route wiring, tool page headers, and tool component journeys in `jsdom`.
- `tests/e2e/` covers direct routes, registry consistency, accessibility smoke checks, bcrypt and XML workflows, and responsive layouts.
- Performance budgets currently run only in CI mode and currently cover the homepage plus UUID, Base64, Hash, and Cron flows. Bcrypt and XML keep functional e2e coverage only.

## Recent Changes

- Added the bcrypt hash generator with adjustable rounds, fresh salts per run, and clipboard-ready output.
- Added bcrypt unit, integration, e2e, and registry coverage and inserted the route into the sequential tool-page navigation flow.
- Rebalanced the XML formatter into a matched two-pane layout with resilient output retention after invalid input.
- Expanded the cron route into side-by-side builder and explainer workflows with responsive layout coverage.

<!-- MANUAL ADDITIONS START -->
- Use PowerShell for npm commands in this repository. If machine-specific command wrappers or local resource paths are needed, read `LOCAL.md` when it exists.
- `LOCAL.md` is for local-only paths, command wrappers, and workstation-specific notes, and should not be committed.
- For new tools, use `createToolDefinition` in `lib/tools/registry.ts`, add `app/tools/<slug>/page.tsx`, add `components/tools/<slug>/`, implement `lib/tools/processors/<slug>.ts` and `lib/validation/<slug>.ts`, and validate with `tests/unit`, `tests/integration`, and `tests/e2e`.
<!-- MANUAL ADDITIONS END -->
