## Why

The cron page currently renders the explainer, builder, errors, and summaries as one long vertical sequence, which makes the page feel oversized once both workflows are present. Rebalancing the layout will reduce scrolling on wider screens and make it easier to compare the builder and explainer side by side.

## What Changes

- Reorganize the cron page so the guided cron builder sits in the left column and the cron explainer sits in the right column on larger viewports.
- Group each workflow's inputs, validation, and results together so the page reads as two parallel tools instead of one long stack.
- Preserve a single-column stacked layout on smaller screens so the page remains usable on mobile devices.
- Keep the existing cron builder and explainer behaviors unchanged apart from their presentation and responsive layout.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `cron-explainer`: Update the cron page presentation requirements so the builder and explainer are displayed as parallel workflows on wide screens and stacked responsively on narrow screens.

## Impact

- Affected UI: `components/tools/cron/cron-tool.tsx`, `components/tools/cron/cron-builder.module.css`, and related cron workflow components
- Affected behavior contract: `openspec/specs/cron-explainer/spec.md`
- Affected verification: integration and e2e tests for cron page layout and workflow coexistence
- Dependencies: no new dependencies or backend changes
