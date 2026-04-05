## 1. Tool scaffolding and UI

- [x] 1.1 Register the `regex` tool in the catalog and shared navigation, then add the `/tools/regex` route and metadata using the standard tool-page shell.
- [x] 1.2 Build the regex client component with flavor selection, regex expression and sample-text inputs, submit-driven analysis, responsive layout, and separate explanation and match-detail presentation.

## 2. Validation and flavor-aware processing

- [x] 2.1 Add regex-specific validation for selected flavor, expression input, sample-text input, supported free-text limits, and actionable field-error formatting.
- [x] 2.2 Implement browser-side regex processor helpers for flavor-aware tokenization, deterministic explanation generation, Java and PL/SQL compatibility checks, and safe translation of the supported subset into browser-executable regexes.
- [x] 2.3 Implement sample-text evaluation results covering any-match status, full-match status, bounded match rows with positions and capture groups, and unsupported-construct messaging when exact browser execution is not possible.

## 3. Verification

- [x] 3.1 Add unit and integration coverage for the regex validation schema, flavor-aware processor logic, registry wiring, direct route rendering, and primary analysis flows.
- [x] 3.2 Add or extend Playwright coverage for catalog discovery, Java regex analysis, PL/SQL regex analysis, unsupported-pattern feedback, and responsive layout behavior.
