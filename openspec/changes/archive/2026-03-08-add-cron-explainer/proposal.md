## Why

The cron tool currently only supports building expressions from guided inputs, which blocks users who already have a cron string and need a quick explanation. Adding an explainer on the cron page closes that workflow gap and makes the tool useful for both creating and understanding 5-field and 6-field schedules.

## What Changes

- Add a cron explainer workflow to the existing cron page where users can paste or type a raw cron expression.
- Accept both 5-field and 6-field cron expressions and produce a plain-language explanation when the expression is valid.
- Show clear validation feedback when the expression is empty, has the wrong number of fields, or cannot be interpreted.
- Keep the existing cron builder workflow available on the same page without removing its current behavior.

## Capabilities

### New Capabilities
- `cron-explainer`: Explain valid 5-field and 6-field cron expressions directly from user input on the cron tool page.

### Modified Capabilities
- None.

## Impact

- Affected UI: `app/tools/cron/page.tsx` and `components/tools/cron/*`
- Affected processing and validation: `lib/tools/processors/cron.ts` and cron validation helpers
- Affected test coverage: unit, integration, and e2e tests for the cron tool
- Dependency impact: reuse the existing `cronstrue` package; no new external service is required
