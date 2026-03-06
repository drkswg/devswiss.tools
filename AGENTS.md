# DevTools Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-03

## Active Technologies

- TypeScript 5.x on Node.js 20.9+ + Next.js 16 App Router, React 19, next/font, CSS Modules + CSS custom properties, lucide-react, uuid, cronstrue, zod, Vitest, React Testing Library, Playwright, @axe-core/playwright (001-devtools-tool-suite)

## Project Structure

```text
app/
components/
lib/
styles/
public/
tests/
```

## Commands

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

## Code Style

TypeScript strict mode, App Router Server Components by default, Client Components only for interactive tool UIs, CSS Modules with shared design tokens, and browser-first processing for all MVP tools.

## Recent Changes

- 001-devtools-tool-suite: Added TypeScript 5.x on Node.js 20.9+ + Next.js 16 App Router, React 19, next/font, CSS Modules + CSS custom properties, lucide-react, uuid, cronstrue, zod, Vitest, React Testing Library, Playwright, @axe-core/playwright

<!-- MANUAL ADDITIONS START -->
- Use PowerShell for all npm commands in this repository: `powershell.exe -NoProfile -Command "Set-Location 'C:\\Users\\kodia\\IdeaProjects\\DevTools'; & 'C:\\Program Files\\nodejs\\npm.cmd' <npm args>"`.
- For new tools, use `createToolDefinition` in `lib/tools/registry.ts`, add `app/tools/<slug>/page.tsx`, and validate with `tests/unit`, `tests/integration`, and `tests/e2e` plus the checklist in `specs/001-devtools-tool-suite/quickstart.md`.
<!-- MANUAL ADDITIONS END -->
