## Context

The XML formatter currently renders its source and output workflows as two independent cards in a two-column grid. Each pane contains a different amount of content above the textarea, and the textareas themselves use a fixed `min-height: 24rem`. That combination causes two issues called out by the request:

- the text windows do not start at the same vertical position, which makes side-by-side comparison awkward
- the editors do not take advantage of larger viewport space, so the workspace feels cramped even when the tool page has room

The change is limited to the XML tool page and should preserve all current transform, upload, copy, and download behavior.

## Goals / Non-Goals

**Goals:**
- Keep the XML source and output textareas aligned in the desktop two-column layout.
- Make the XML workspace scale to the viewport with larger usable editor areas on larger screens.
- Preserve existing tool actions, validation feedback, accessibility labels, and stacked mobile behavior.
- Keep the implementation inside the current React component and CSS module structure.

**Non-Goals:**
- Changing XML transform logic, validation rules, or file-processing behavior.
- Redesigning the shared tool-page shell or unrelated tools.
- Adding resizable split panes, drag handles, or persistent layout preferences.

## Decisions

1. Restructure each pane around a shared layout rhythm.
   The source and output panes should expose the same high-level vertical structure: header, primary editor region, and supporting controls/feedback. This avoids the current mismatch where one pane's controls push its textarea lower than the other.

   Alternative considered: keep the markup unchanged and only adjust CSS spacing. Rejected because the existing DOM order bakes in different pre-textarea content heights, which makes precise textarea alignment brittle.

2. Make the editor region the flexible portion of each pane.
   The textarea container should grow with available vertical space using CSS grid or flex rows, while retaining a sensible minimum height for shorter viewports. This provides larger editing surfaces on desktop without relying on hard-coded textarea heights alone.

   Alternative considered: only increase the textarea `min-height`. Rejected because it would make the editors bigger, but it would not solve alignment and would still be arbitrary across different viewport sizes.

3. Preserve the existing responsive breakpoint behavior, but improve tablet and desktop fit.
   The tool should remain a two-column comparison layout on sufficiently wide screens and continue stacking on narrow screens. Within the two-column layout, panes should stretch to equal height and editors should remain visually aligned; within the stacked layout, editors should expand to full available width.

   Alternative considered: force a single-column layout earlier to hide alignment issues. Rejected because it reduces the usefulness of the XML comparison workflow on medium and large screens.

4. Validate layout behavior through browser-level tests.
   The existing e2e suite already checks side-by-side and stacked pane placement. The change should extend those checks to assert aligned source/output textarea positions in desktop mode and retain the stacked layout expectations on narrow viewports.

   Alternative considered: rely only on visual inspection. Rejected because the regression risk is primarily spatial and is better protected with explicit bounding-box assertions.

## Risks / Trade-offs

- Different pane content may still create subtle height variance if feedback/status blocks appear conditionally. → Reserve the editor region as the stable comparison area and target test assertions at the textareas rather than the full card height.
- More adaptive sizing can create overly tall textareas on very large displays. → Use `clamp(...)`-style sizing and minimum/maximum bounds instead of unbounded growth.
- Reordering controls to improve alignment could affect perceived workflow familiarity. → Keep actions within their current pane and preserve labels/semantics while only changing vertical placement and spacing.
