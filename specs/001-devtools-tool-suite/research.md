# Research: DevTools Tool Suite

## Decision: Use Next.js 16 App Router with a root layout and Metadata API

- **Decision**: Build the site on the current App Router with `app/layout.tsx` as the required root layout and route-level metadata/manifest support.
- **Rationale**: The current Next.js installation and App Router guidance recommends App Router for new applications, requires a root layout, and provides built-in metadata and file-based routing that fit a small multi-route utility site.
- **Alternatives considered**:
  - **Pages Router**: Rejected because it adds legacy patterns without improving the utility-site use case.
  - **Single-route SPA inside one page**: Rejected because dedicated routes per tool improve linking, metadata, testing, and future expansion.
- **References**:
  - https://nextjs.org/docs/app/getting-started/installation
  - https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest

## Decision: Default to Server Components for route shells and use Client Components only for interactive tools

- **Decision**: Keep `app/page.tsx`, `app/tools/*/page.tsx`, layout, metadata, and static marketing/catalog content as Server Components by default. Put generators, validators, form state, clipboard interactions, and live previews inside tool-specific Client Components.
- **Rationale**: Next.js uses Server Components by default and recommends limiting `"use client"` boundaries to reduce client-side JavaScript. This fits a catalog shell that is mostly static with interactive tool islands.
- **Alternatives considered**:
  - **All-client application shell**: Rejected because it would increase initial JavaScript and reduce the value of App Router defaults.
  - **All-server rendering for tool logic**: Rejected because the clarified spec requires all initial processing to remain in the browser.
- **References**:
  - https://nextjs.org/docs/app/guides/production-checklist
  - https://nextjs.org/docs/app/getting-started/server-and-client-components

## Decision: Do not use Route Handlers or Server Actions for MVP tool processing

- **Decision**: Expose no app-managed HTTP API in MVP and avoid Server Actions for core tool behavior. Route Handlers remain out of scope unless a future feature introduces a genuine backend integration, webhook, or secret-bearing operation.
- **Rationale**: The clarified spec and constitution require in-browser processing for the initial tools. Official Next.js guidance positions Route Handlers as custom request handlers and Server Actions as mutation/form helpers; neither is required for local utility calculations.
- **Alternatives considered**:
  - **Internal Route Handlers for tool execution**: Rejected because this would add unnecessary server hops and violate the clarified frontend-only boundary.
  - **Server Actions for form submissions**: Rejected because there are no server-side mutations or secrets in the MVP flows.
- **References**:
  - https://nextjs.org/docs/app/getting-started/route-handlers
  - https://nextjs.org/docs/app/getting-started/error-handling

## Decision: Statically render all tool routes and lazy-load heavy client logic

- **Decision**: Render the home route and initial tool routes as static shells, then lazy-load the interactive client modules and any heavier helper libraries on the routes that need them.
- **Rationale**: The production checklist highlights static rendering, route-segment code splitting, and careful client-boundary placement as built-in performance advantages. This is a strong fit for anonymous utility pages with no per-request data.
- **Alternatives considered**:
  - **Dynamic rendering for all routes**: Rejected because the site has no request-time data and would lose caching/performance benefits.
  - **Eagerly bundling all tool logic on the homepage**: Rejected because it would make the catalog page slower and raise the risk of missing the JavaScript budget.
- **References**:
  - https://nextjs.org/docs/app/guides/production-checklist

## Decision: Use shared design tokens, CSS Modules, and optimized fonts for the IntelliJ-inspired UI

- **Decision**: Implement the visual system with CSS custom properties in `styles/tokens.css`, compose route/component styles with CSS Modules, and load display/body fonts through `next/font`.
- **Rationale**: The constitution requires a shared design-token approach, while Next.js recommends the Font Module to reduce layout shift and external requests. CSS Modules keep styles local without forcing a utility-class workflow onto a small, highly branded UI.
- **Alternatives considered**:
  - **Tailwind as the primary styling system**: Rejected for MVP because the site can achieve the desired design system with fewer abstractions and more deliberate visual control.
  - **Global-only CSS**: Rejected because future tool growth benefits from component-scoped styling boundaries.
- **References**:
  - https://nextjs.org/docs/app/guides/production-checklist

## Decision: Use a registry-driven tool architecture for extensibility

- **Decision**: Represent each tool through a typed registry entry containing route slug, label, icon, accent token, description, and component loader metadata.
- **Rationale**: The feature spec requires future tools to be addable without changing the navigation model or visual pattern. A registry-driven model keeps homepage tiles, route generation, metadata, and test coverage aligned.
- **Alternatives considered**:
  - **Hard-code tool cards directly in the homepage**: Rejected because it would make future additions error-prone and duplicate navigation metadata.
  - **Generate routes dynamically from remote content**: Rejected because MVP has no backend and no need for runtime route discovery.

## Decision: Use browser-native APIs first, with focused utility libraries only where the platform is insufficient

- **Decision**: Use Web Crypto for SHA-1, SHA-256, and SHA-512; `TextEncoder`/`TextDecoder` for Unicode-safe text processing; the `uuid` package for versions 1, 3, 4, 5, and 7; and `cronstrue` for human-readable cron summaries.
- **Rationale**: Native APIs keep dependencies lean, but UUID variants beyond `crypto.randomUUID()` and readable cron summaries benefit from focused, mature libraries.
- **Alternatives considered**:
  - **Single heavy crypto utility package for every tool**: Rejected because it would increase bundle cost and duplicate browser capabilities.
  - **Hand-written cron summary logic**: Rejected because it is easy to get wrong and harder to maintain.

## Decision: Test client components with Vitest/RTL and validate end-to-end flows with Playwright

- **Decision**: Use Vitest plus React Testing Library for synchronous client logic/components, and use Playwright for end-to-end, route-level, and accessibility smoke coverage.
- **Rationale**: Next.js documents both Vitest and Playwright. The current Vitest guide notes that async Server Components are better covered via E2E tests, which matches this architecture of static route shells plus client-side tool modules.
- **Alternatives considered**:
  - **Unit-test every route shell**: Rejected because E2E coverage gives stronger confidence for App Router navigation and accessibility.
  - **E2E-only coverage**: Rejected because fast unit coverage is still valuable for encoding/validation helpers and client tool state.
- **References**:
  - https://nextjs.org/docs/app/guides/testing/vitest
  - https://nextjs.org/docs/app/guides/testing/playwright

## Decision: Add explicit error, 404, and loading UI even though routes are primarily static

- **Decision**: Include `app/global-error.tsx`, `app/global-not-found.tsx`, and segment-level loading/error states for tool routes where lazy client modules or future metadata expansion can fail.
- **Rationale**: The production checklist recommends global error and 404 UI, and the error-handling guide distinguishes expected UI errors from uncaught exceptions. Utility workflows need predictable recovery paths when validation, clipboard, or rendering issues occur.
- **Alternatives considered**:
  - **Rely on default framework fallbacks**: Rejected because branded recovery states are part of a polished developer utility experience.
