## 1. Tool scaffolding

- [x] 1.1 Extend the tool contracts and registry with XML-specific action modes and a new XML Formatter definition.
- [x] 1.2 Add the `/tools/xml` page shell and baseline XML tool component/module structure.

## 2. XML processing

- [x] 2.1 Add XML validation and transformation helpers for beautify, minify, and XML-to-JSON conversion, including deterministic conversion rules and parse error handling.
- [x] 2.2 Add browser-side helpers for XML file import and XML result download without introducing a server dependency.

## 3. XML tool UI

- [x] 3.1 Build the two-pane XML formatter UI with source input, output display, explicit transform actions, and 2-space, 3-space, and 4-space formatting controls.
- [x] 3.2 Add copy actions for both panes, XML upload into the source pane, XML download for eligible output states, and user-facing validation/copy feedback.

## 4. Verification

- [x] 4.1 Add unit tests for XML formatting, minification, XML-to-JSON conversion, indentation selection, and malformed XML handling.
- [x] 4.2 Add integration and e2e coverage for the dual-pane workflow, transform actions, copy controls, file upload, and XML download behavior.
