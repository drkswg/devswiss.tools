## Context

The cron page currently supports one direction of the workflow: users choose guided field values and the client produces a cron expression plus a human-readable summary. The processing logic already relies on `cronstrue` to translate valid expressions into plain language, but the UI and validation model are limited to structured builder input rather than raw cron text.

This change adds the reverse workflow on the same page. Users who already have a cron string need a direct explanation path without manually mapping each field back into the builder controls. The implementation should stay browser-first, preserve the existing builder behavior, and avoid introducing a server dependency for parsing or explanation.

## Goals / Non-Goals

**Goals:**
- Add a raw-expression explainer on the cron page for 5-field and 6-field cron input.
- Return a clear plain-language explanation for valid expressions.
- Surface actionable validation errors for empty, malformed, or unsupported expressions.
- Reuse shared explanation logic so builder output and explainer output stay consistent.

**Non-Goals:**
- Replacing the existing cron builder.
- Supporting cron syntaxes outside the current product scope, such as 7-field expressions or scheduler-specific extensions beyond what the chosen parser can interpret.
- Converting arbitrary raw expressions back into builder form.

## Decisions

Add a second cron workflow inside the existing `CronTool` UI rather than a new page or separate tool.
Rationale: users already reach `/tools/cron` for cron-related tasks, and explanation is the natural complement to generation. Keeping both workflows together preserves discovery and avoids duplicating page shell, metadata, and tests.
Alternative considered: create a separate tool page. Rejected because the feature is tightly coupled to the current cron tool and would fragment a single domain workflow across routes.

Introduce a dedicated raw-expression validation and explanation path in the cron processor layer.
Rationale: the current processor accepts a structured `CronDraft`, so explainer input needs its own parsing logic. The processor should normalize whitespace, verify that the expression has either 5 or 6 fields, then call `cronstrue` to generate the explanation and return UI-friendly error states.
Alternative considered: perform parsing directly in the component. Rejected because it would duplicate validation logic, complicate testing, and make consistency with the builder harder to maintain.

Share the explanation formatting logic where possible instead of maintaining independent summary rules.
Rationale: the builder already enhances `cronstrue` output with clearer phrasing for common daily schedules. Reusing or refactoring that logic keeps both workflows aligned and reduces the chance that the same expression is described differently depending on entry point.
Alternative considered: accept raw `cronstrue` output for the explainer only. Rejected because it would create inconsistent user-facing language inside the same tool.

Keep explainer submission explicit with a form action rather than live-updating on every keystroke.
Rationale: it matches the existing builder interaction model, keeps validation timing predictable, and avoids noisy invalid states while the user is still typing or pasting.
Alternative considered: explain on input change. Rejected because cron strings are often pasted incrementally and transient errors would be distracting.

## Risks / Trade-offs

[Different cron dialect expectations] -> Limit support to 5-field and 6-field expressions and state validation failures clearly when an expression cannot be explained.

[Inconsistent summaries between builder and explainer] -> Refactor summary generation into shared helpers and cover matching cases with unit tests.

[Crowded cron page layout] -> Present the explainer as a separate panel with its own input and result area while preserving existing page hierarchy and mobile readability.

[Regression in existing builder flow] -> Keep the builder state isolated from explainer state and retain current integration and e2e scenarios alongside new ones.
