# Quickstart: DevTools Tool Suite

## Prerequisites

- Node.js 20.9 or newer
- npm 10 or newer

## Run locally

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

Open `http://localhost:3000`.

## Expected routes

- `/` - tool catalog homepage
- `/tools/uuid` - UUID generator and validator
- `/tools/base64` - Base64 encoder and decoder
- `/tools/hash` - hash generator
- `/tools/cron` - cron expression generator

## Add-a-tool workflow

1. Add a new `createToolDefinition(...)` entry in `lib/tools/registry.ts`.
2. Create a matching route in `app/tools/<slug>/page.tsx` and wire `buildToolMetadata(tool)`.
3. Add tool processing and validation logic in `lib/tools/processors/` and `lib/validation/`.
4. Add unit, integration, and e2e coverage for the new tool flow.
5. Run all quality gates and confirm existing tools still render and navigate correctly.

### Add-a-tool acceptance checklist

- New tool appears as a large tile in the homepage catalog.
- New tile uses the same icon/tile styling and interaction pattern.
- Tile link and direct route load the same tool page.
- Existing tools keep their labels, links, and ordering.
- Validation, error, and copy-feedback states are present for the new tool.
- Accessibility smoke checks pass for homepage and new tool route.

## Manual verification checklist

1. Homepage catalog
   - Four large tool tiles render with prominent icons.
   - Tile accents use the approved orange, green, blue, and yellow theme tokens against the dark gray background.
   - Keyboard users can tab through all tiles and activate them.

2. UUID tool
   - Users can switch between versions `1`, `3`, `4`, `5`, and `7`.
   - Version `3` and `5` generation requests surface namespace/name inputs.
   - Validation clearly reports valid and invalid UUID values.

3. Base64 tool
   - Encode converts plain text to Base64.
   - Decode returns Unicode-safe plain text.
   - Malformed Base64 input produces a visible error state.

4. Hash tool
   - Algorithms `MD5`, `SHA-1`, `SHA-256`, and `SHA-512` are available.
   - `MD5` and `SHA-1` show a legacy label/warning.
   - Copy-to-clipboard feedback is visible after successful generation.

5. Cron tool
   - The builder outputs a six-field cron expression including seconds.
   - A readable schedule summary updates with the generated expression.
   - Conflicting or incomplete schedules show actionable validation feedback.
   - Copying the generated cron expression shows success feedback or a clear browser-blocked message.

6. Accessibility and responsive behavior
   - All flows are reachable by keyboard only.
   - Focus states remain visible on a dark background.
   - Page content remains usable at mobile and desktop widths.
   - Manual keyboard verification notes are captured for the homepage and each tool route.

## Sign-off evidence

### Accessibility evidence

Automated scan run on 2026-03-05:

- Command: `npm run test:e2e` (Chromium + Firefox projects)
- Result: `12 passed`, `2 skipped`, `0 accessibility violations`
- Coverage: homepage, UUID, Base64, Hash, Cron, catalog consistency routes

Manual keyboard-only verification notes (2026-03-05):

- Homepage (`/`): tab order reaches hero actions and all tool tiles; `Enter` opens focused tile.
- UUID (`/tools/uuid`): keyboard reaches version selector, generate/validate actions, and copy action.
- Base64 (`/tools/base64`): keyboard reaches input, encode/decode actions, and copy action.
- Hash (`/tools/hash`): keyboard reaches algorithm selector, generate action, and copy action.
- Cron (`/tools/cron`): keyboard reaches all six selectors, generate action, and copy action.
- Shared behavior: visible focus ring remains readable on dark surfaces and on accent-highlighted elements.

### Performance evidence

Production-mode measurements run on 2026-03-05 with:

- `CI=1 npm run test:e2e -- --project=chromium tests/e2e/performance-budgets.spec.ts`

Core Web Vitals (budget: LCP <= 2500ms, CLS <= 0.1, INP <= 200ms):

| Route | LCP (ms) | CLS | INP (ms) | Status |
|------|----------|-----|----------|--------|
| `/` | 136 | 0.000 | 40 | PASS |
| `/tools/uuid` | 152 | 0.000 | 72 | PASS |
| `/tools/base64` | 152 | 0.000 | 88 | PASS |
| `/tools/hash` | 152 | 0.000 | 144 | PASS |
| `/tools/cron` | 172 | 0.000 | 72 | PASS |

Initial JavaScript payload (budget: <= 170KB gzip):

| Metric | Value | Status |
|-------|-------|--------|
| Build initial JS payload (`rootMainFiles + polyfillFiles`, gzip) | 155.5KB | PASS |

Diagnostic per-route script transfer from the same Chromium run:

| Route | Transfer (KB) |
|------|---------------|
| `/` | 496.6 |
| `/tools/uuid` | 343.0 |
| `/tools/base64` | 340.3 |
| `/tools/hash` | 346.7 |
| `/tools/cron` | 349.3 |

Remediation applied:

- Added route-level metadata and registry keyword derivation on homepage.
- Added indexed registry lookups and frozen icon map objects.
- Added production-only performance budget test for repeatable sign-off metrics.

### Build and regression verification

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS (`10 files`, `30 tests`)
- `npm run build`: PASS (all app routes static)
- `npm run test:e2e`: PASS (`12 passed`, `2 skipped`)

## Quality gates

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
& 'C:\Program Files\nodejs\npm.cmd' run lint
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
& 'C:\Program Files\nodejs\npm.cmd' run test
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e
```

## Production-like e2e run

Next.js recommends running end-to-end tests against production output when practical.

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
$env:CI='1'
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e -- --project=chromium tests/e2e/performance-budgets.spec.ts
```

Optional WebKit run (disabled by default in local runs to avoid environment-specific worker crashes):

```powershell
Set-Location 'C:\Users\kodia\IdeaProjects\DevTools'
$env:E2E_WEBKIT='1'
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e
```
