## Context

All tool routes use the shared `ToolPageShell` component to render the page-level intro block before the tool UI. That shell currently combines the page title, short description, optional helper copy, and navigation actions inside a large header treatment, and each tool page passes helper text that expands the first block without adding much task-starting value.

This change is cross-cutting because the same shell and pattern are reused by every tool page. The desired outcome is a leaner, more compact header that keeps the most useful summary line and existing navigation buttons while dropping the extra helper copy from the top of the page.

## Goals / Non-Goals

**Goals:**
- Reduce the visual height of the shared tool-page header across all tool routes.
- Keep the title and concise tool description visible so users immediately understand what the tool does.
- Preserve the existing header navigation actions, including back-to-catalog and next-tool buttons.
- Centralize the presentation change in the shared shell so all tools stay consistent.

**Non-Goals:**
- Changing any tool processing, validation, or result behavior.
- Rewriting the per-tool descriptions already stored in the registry.
- Introducing new navigation patterns or additional header content.

## Decisions

Remove the `helperText` row from the shared tool-page header contract and stop passing helper copy from tool pages.
Rationale: the helper block is the part called out as oversized and low-value, and it is the only header content duplicated per page outside the concise description already maintained in the tool registry.
Alternative considered: keep helper text support and hide it selectively per page. Rejected because the request applies to every tool page and selective suppression would preserve unnecessary API surface in the shared shell.

Keep the short description sourced from each tool definition as the primary summary line in the header.
Rationale: the registry descriptions are already concise, task-oriented, and consistent with the requested examples, so reusing them avoids new copy duplication and keeps the top block useful.
Alternative considered: create a second, header-specific summary field per tool. Rejected because the current descriptions already satisfy the requirement and a second field would create needless content drift.

Tighten the shell header spacing and typography in `tool-page-shell.module.css` rather than building a new variant component.
Rationale: the change is purely presentational and scoped to one shared shell. Updating spacing in place keeps the implementation small and ensures all tool pages inherit the same compact layout immediately.
Alternative considered: build a separate compact header component for tools. Rejected because it would duplicate the existing shell abstraction for a minor layout adjustment.

## Risks / Trade-offs

[Some helper guidance currently visible above the fold disappears] -> Keep the concise summary in the header and rely on the tool form labels, inline help, and result messaging for workflow-specific guidance.

[A smaller header could make pages feel visually abrupt] -> Retain the title, description, accent treatment, and action row so the page still has a clear entry point without excessive vertical padding.

[Cross-page regressions could leave one tool with stale helper props or inconsistent spacing] -> Update all tool page entries together and verify each route still exposes its heading and navigation controls in shared coverage.
