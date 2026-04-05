## 1. Tool scaffolding and UI

- [x] 1.1 Register the `timestamp` tool in the catalog and shared navigation, then add the `/tools/timestamp` route and metadata using the standard tool-page shell.
- [x] 1.2 Build the timestamp client component with separate explain and generate workflows, unit and timezone controls, responsive two-column layout, and copy-ready result presentation.

## 2. Validation and conversion logic

- [x] 2.1 Add timestamp-specific validation for signed raw timestamp input, unit selection, `datetime-local` input, timezone selection, output unit selection, and actionable field-error formatting.
- [x] 2.2 Implement browser-side timestamp processor helpers for explanation and reverse conversion, including auto unit resolution, deterministic UTC formatting, out-of-range handling, and normalized timestamp output for copy.

## 3. Verification

- [x] 3.1 Add unit and integration coverage for the timestamp processor, validation schema, registry wiring, and direct route rendering.
- [x] 3.2 Add or extend Playwright coverage for catalog discovery, timestamp explanation, date/time-to-timestamp conversion, copy behavior, and responsive layout.
