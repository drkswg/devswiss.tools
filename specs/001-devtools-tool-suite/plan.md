# Implementation Plan: DevTools Tool Suite

**Branch**: `001-devtools-tool-suite` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-devtools-tool-suite/spec.md`

**Note**: This plan applies the current frontend-only constitution and current Next.js App Router guidance.

## Summary

Build DevTools as a frontend-only Next.js App Router application with a statically rendered catalog shell and isolated client-side tool modules for UUID, Base64, Hash, and Cron. Use a registry-driven tool architecture, tokenized IntelliJ-inspired theming, and Next.js production defaults so future tools can be added without changing navigation, routing, or layout patterns.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20.9+  
**Primary Dependencies**: Next.js 16 App Router, React 19, next/font, CSS Modules + CSS custom properties, lucide-react, uuid, cronstrue, zod, Vitest, React Testing Library, Playwright, @axe-core/playwright  
**Storage**: In-memory browser state, Clipboard API, no internal DB  
**Testing**: Vitest + React Testing Library for synchronous client logic/components; Playwright + @axe-core/playwright for e2e and accessibility smoke  
**Target Platform**: Modern evergreen browsers on desktop and mobile (current stable Chrome, Edge, Firefox, and Safari)  
**Project Type**: Frontend-only Next.js web application  
**Performance Goals**: LCP <= 2.5s, CLS <= 0.1, INP <= 200ms, initial route JS <= 170KB gzip, core tool responses <= 1s for normal inputs  
**Constraints**: WCAG 2.2 AA, all initial tool processing stays in the browser, no app-owned backend/API for MVP, IntelliJ IDEA dark-theme palette, large tile-based tool catalog, future tools must plug into the same registry/layout  
**Scale/Scope**: 5 primary routes (home + 4 tool pages), anonymous users, registry-driven catalog supporting future tool modules without route redesign

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Frontend-only boundary upheld: all MVP calculations stay in browser; no app-managed backend endpoints are introduced.
- [x] Accessibility acceptance criteria defined: keyboard navigation, semantic labeling, focus visibility, contrast, and copy/validation feedback are part of quickstart validation, with automated scans and manual keyboard verification notes required at sign-off.
- [x] Performance impact addressed: static route shells, limited client boundaries, route-level code splitting, and lazy loading for heavier tool logic keep bundles under budget, with final CWV and bundle measurements captured at sign-off.
- [x] Type-safe contracts defined: registry entries, tool inputs, and tool outputs are modeled explicitly in `data-model.md` and `contracts/public-api.openapi.yaml`.
- [x] CI quality gates mapped: lint, type-check, unit tests, and Playwright e2e/accessibility smoke are included in the plan and quickstart.
- [x] No principle exceptions required at planning time.

## Project Structure

### Documentation (this feature)

```text
specs/001-devtools-tool-suite/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-api.openapi.yaml
│   └── README.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── layout.tsx
├── page.tsx
├── global-error.tsx
├── global-not-found.tsx
├── manifest.ts
└── tools/
    ├── uuid/page.tsx
    ├── base64/page.tsx
    ├── hash/page.tsx
    └── cron/page.tsx

components/
├── layout/
├── marketing/
├── tool-shell/
├── tools/
│   ├── uuid/
│   ├── base64/
│   ├── hash/
│   └── cron/
└── ui/

lib/
├── tools/
│   ├── registry.ts
│   ├── contracts.ts
│   ├── metadata.ts
│   └── processors/
├── validation/
└── utils/

styles/
├── globals.css
└── tokens.css

public/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Use the App Router for route ownership and metadata, keep each tool on its own `/tools/<slug>` page, centralize catalog metadata in `lib/tools/registry.ts`, and isolate interactive code inside tool-specific client components so the shared layout and catalog remain lean and extensible.

## Complexity Tracking

No constitution violations are expected at plan time. Add an entry here only if implementation later requires an approved exception such as a temporary bundle-budget increase.
