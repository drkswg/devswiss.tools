## Why

The shared header block on each tool page is currently oversized and front-loads verbose helper text that does not help users start the task. Tightening that section to a compact summary plus navigation will make the tools feel faster to scan and reduce wasted vertical space across the suite.

## What Changes

- Replace the current large tool-page header treatment with a more compact shared layout.
- Keep each page's short, task-oriented tool description visible at the top of the page.
- Remove the extra helper text block from the shared header so only high-value summary content remains.
- Preserve the existing navigation actions in the header, including the back-to-catalog and next-tool buttons.

## Capabilities

### New Capabilities
- `tool-page-header`: Present every tool page with a compact shared header that shows a concise summary and navigation actions without extra helper copy.

### Modified Capabilities
- None.

## Impact

- Affected UI: `components/tool-shell/tool-page-shell.tsx`, `components/tool-shell/tool-page-shell.module.css`, and the tool page entries under `app/tools/`
- Affected behavior contract: new `tool-page-header` spec for shared tool-page presentation
- Affected verification: integration or e2e coverage for tool-page header content and navigation visibility
- Dependencies: no new dependencies, APIs, or backend changes
