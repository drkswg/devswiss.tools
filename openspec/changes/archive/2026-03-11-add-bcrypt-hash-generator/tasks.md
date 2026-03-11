## 1. Tool scaffolding and dependencies

- [x] 1.1 Add a browser-compatible bcrypt runtime dependency and register a new `bcrypt` tool definition in the catalog with the correct order, copy, keywords, and next-tool navigation updates.
- [x] 1.2 Add the `/tools/bcrypt` route and client tool component using the shared tool shell, including plain-text input, rounds control, submit action, salted-output guidance, and copy-ready result presentation.

## 2. Validation and generation workflow

- [x] 2.1 Implement bcrypt-specific validation for plain text and rounds values from `1` through `20`, including actionable field-error formatting.
- [x] 2.2 Implement the browser-side bcrypt processor and wire it into the tool component with asynchronous submission, loading feedback, valid/error states, and no server round-trip.

## 3. Verification

- [x] 3.1 Add unit and integration coverage for the bcrypt processor, validation schema, registry wiring, and direct route rendering.
- [x] 3.2 Add or extend Playwright coverage for catalog discovery and the primary bcrypt generation journey, then run the relevant checks for the new tool.
