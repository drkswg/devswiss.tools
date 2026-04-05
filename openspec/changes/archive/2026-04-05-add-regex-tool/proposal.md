## Why

The current tool catalog helps with identifiers, encodings, hashes, cron expressions, XML, and timestamps, but it does not cover a common debugging workflow: understanding and testing regular expressions. Adding a browser-local regex tool fills that gap and gives users a way to inspect flavor-specific behavior for Java and PL/SQL without leaving the site.

## What Changes

- Add a new `Regex Tester` tool route to the registry-driven catalog and shared tool navigation.
- Let users choose an initial regex flavor of `Java` or `PL/SQL`, enter a regex expression, and enter sample text to test against the expression.
- Generate a structured explanation of the entered regex that reflects the selected flavor, including notable constructs, flags or modifiers, and flavor-specific caveats when applicable.
- Generate match information for the current sample text, including whether a match exists and details about matched content and positions.
- Validate malformed or unsupported expressions with actionable feedback instead of silent failures.
- Add unit, integration, and e2e coverage for the new processor, validation, route wiring, and primary regex analysis journeys.

## Capabilities

### New Capabilities
- `regex-tester`: Provide a dedicated browser-side tool for entering a regex, selecting a supported language flavor, explaining the pattern, and testing sample text against it.

### Modified Capabilities
- None.

## Impact

- Affected UI: homepage catalog, `app/tools/<slug>/page.tsx`, shared tool navigation, and a new client tool component under `components/tools/`
- Affected logic: new validation schema plus browser-side regex explanation and matching processors under `lib/validation/` and `lib/tools/processors/`
- Affected verification: unit, integration, and Playwright coverage for the new tool and registry wiring
- Dependencies: likely one regex parsing dependency or a small flavor-aware analysis layer to explain expressions consistently in the browser without a server round-trip
