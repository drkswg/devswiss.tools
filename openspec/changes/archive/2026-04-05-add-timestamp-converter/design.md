## Context

The current app adds each tool through the same layers: a registry definition, a thin App Router page, a client-side tool component, processor helpers in `lib/tools/processors/`, validation in `lib/validation/`, and layered unit, integration, and e2e coverage. A timestamp converter fits that pattern, but it introduces two sources of ambiguity that need explicit design decisions before implementation: Unix timestamps may be provided in either seconds or milliseconds, and human-entered date/time values need a clear timezone interpretation before they can be converted back into a timestamp.

The feature also overlaps with the existing cron page structure more than the single-result tools. Users need two complementary workflows on one page: one form to explain a raw timestamp and another to convert a date/time input into a timestamp that can be copied. The implementation should stay browser-local and dependency-light by relying on platform date APIs instead of external services.

## Goals / Non-Goals

**Goals:**
- Add a dedicated `/tools/timestamp` route and registry entry for a `Timestamp Converter` tool.
- Let users explain a Unix timestamp and see the resolved unit plus readable date/time output.
- Let users convert a date/time value into a Unix timestamp with explicit unit and timezone handling.
- Support copying the latest valid generated timestamp through the shared result workflow.
- Keep conversion logic browser-local and cover the workflow with unit, integration, and e2e tests.

**Non-Goals:**
- Adding live clocks, continuously updating "current timestamp" widgets, or relative "time ago" displays in this change.
- Supporting microsecond or nanosecond timestamp formats.
- Adding arbitrary IANA timezone selection beyond a simple explicit UTC vs local interpretation.
- Sending date conversion requests to a server or persisting timestamp history.

## Decisions

Add the timestamp converter as a standalone tool route with two companion workflows on the same page.
Rationale: timestamp inspection and reverse conversion form a cohesive tool, but they are distinct enough to benefit from separate form states and result messages. A dedicated page keeps the registry, metadata, and navigation aligned with the rest of the tool catalog, while a two-column responsive layout can reuse the proven pattern from the cron page.
Alternative considered: fold timestamp conversion into the cron tool because both concern scheduling/time values. Rejected because Unix timestamp inspection is a broader debugging workflow with different inputs, outputs, and validation behavior.

Model the page as two validated forms backed by a single timestamp processor module, and reuse the existing `convert` action mode in the tool registry.
Rationale: the registry already supports `convert`, so the tool can advertise both "Explain timestamp" and "Generate timestamp" actions without extending shared contracts. Keeping the conversion logic in one processor module preserves the repo's separation between UI, validation, and transformation logic while allowing the two workflows to share normalization and range handling.
Alternative considered: add a new `explain` action mode. Rejected because the existing `convert` mode is sufficient for both directions and avoids an unnecessary cross-cutting registry change.

Accept signed integer timestamp input with a unit selector that supports `auto`, `seconds`, and `milliseconds`.
Rationale: users commonly paste 10-digit second values and 13-digit millisecond values, but some historical or atypical inputs are ambiguous. A default `auto` mode keeps the main case fast, while explicit override options avoid locking the feature into brittle heuristics. The explained result should always show the resolved unit so the user can verify what the tool interpreted.
Alternative considered: require users to choose seconds or milliseconds before every explanation. Rejected because it adds friction to the common paste-and-check workflow.

Convert date/time input with a `datetime-local` control, `UTC` vs `Local` timezone selection, and explicit output-unit selection for seconds or milliseconds.
Rationale: `datetime-local` provides a browser-native editing surface, and `step=1` can preserve seconds precision when users need it. Pairing it with an explicit timezone mode removes ambiguity about how the entered wall-clock time should be interpreted, while a unit selector lets the generated output match common API formats. The processor should parse the control value manually instead of relying on implementation-defined `Date` string parsing.
Alternative considered: assume every date/time input is local time and always output seconds. Rejected because it hides important conversion rules and does not serve APIs that expect millisecond timestamps.

Generate deterministic, copy-ready output using canonical UTC formatting plus a normalized timestamp string.
Rationale: result strings that depend on locale formatting are harder to test and easier to misread across environments. The processor should return a stable UTC date/time representation, an ISO 8601 string, and the normalized timestamp value so the UI can explain the conversion clearly while keeping tests deterministic. Copy support should target the latest successful generated timestamp from the date/time workflow through the existing clipboard helper and result panel.
Alternative considered: present only locale-formatted output with no canonical representation. Rejected because the result would vary across environments and make both testing and debugging harder.

## Risks / Trade-offs

[Auto-detection can misinterpret short or historical millisecond values] -> Keep the resolved unit visible in the result and let users override `auto` with explicit seconds or milliseconds.

[Browser date parsing can be inconsistent for `datetime-local` strings] -> Parse the date/time fields manually in the processor and construct the instant with either `Date.UTC(...)` or the local `Date` constructor based on the selected timezone mode.

[JavaScript `Date` only supports a bounded range of instants] -> Validate converted values before formatting and surface actionable error messaging for out-of-range timestamps instead of rendering `Invalid Date`.

[A two-workflow page can become cramped on smaller screens] -> Reuse the existing responsive workflow-column pattern and cover the route with integration and Playwright checks for stacked mobile layout.

## Migration Plan

This change is additive. Ship the new route, registry entry, processors, validation, and tests together. No data migration is required, and rollback is limited to reverting the feature if needed.

## Open Questions

- None at proposal time.
