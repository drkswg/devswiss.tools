## Context

The cron page now contains two full workflows: a guided builder and a raw-expression explainer. Each workflow has inputs, validation messaging, and output panels, but `CronTool` currently renders them as one vertical sequence, which stretches the page and separates each workflow's inputs from its own results.

The requested change is purely about presentation and responsive structure. The builder must move to the left, the explainer must move to the right on wider screens, and mobile behavior must stay readable by collapsing back to a single column.

## Goals / Non-Goals

**Goals:**
- Present the cron builder in the left column and the cron explainer in the right column on larger viewports.
- Keep each workflow's inputs, validation feedback, and outputs grouped together in the same column.
- Preserve a clean single-column layout on narrow screens.
- Avoid changing existing builder or explainer processing behavior.

**Non-Goals:**
- Changing cron parsing, validation, or result messaging.
- Splitting the cron workflows across different routes.
- Redesigning the individual cards beyond the layout needed to rebalance the page.

## Decisions

Recompose `CronTool` into two workflow columns instead of rendering shared sections at the page root.
Rationale: the current order puts explainer input, then builder input, then builder errors and summary later in the page. Wrapping each workflow into its own column keeps related inputs and outputs together and directly solves the excessive page length on desktop.
Alternative considered: keep the existing component order and use CSS ordering only. Rejected because the builder errors and summaries would still be structurally separate from the builder input, making the layout harder to reason about and maintain.

Use a responsive grid container for the two workflow columns with a breakpoint that collapses to one column on smaller screens.
Rationale: the change is layout-specific and fits naturally into the existing CSS Module. A two-column grid provides predictable left/right placement without altering the internal card components.
Alternative considered: flexbox with manual widths. Rejected because grid is simpler for equal columns and easier to collapse responsively.

Keep `CronBuilder`, `CronExplainer`, `CronErrors`, and `CronSummary` as separate components and only adjust composition.
Rationale: the behavior inside each component already exists and is covered by tests. Limiting the change to composition and layout reduces regression risk.
Alternative considered: merge builder errors and summary into the builder component. Rejected because it expands component responsibilities unnecessarily for a layout-only change.

## Risks / Trade-offs

[Desktop layout becomes cramped on intermediate widths] -> Choose a breakpoint that collapses to one column before the cards feel compressed.

[Visual regressions in workflow ordering] -> Add integration and e2e assertions that the builder and explainer headings appear and remain usable after the layout change.

[Future cron page additions increase column height mismatch] -> Group each workflow vertically within its own column so future additions stay scoped to one side instead of lengthening the entire page flow.
