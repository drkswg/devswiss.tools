## 1. Build highlighted editor surfaces

- [x] 1.1 Add XML/JSON syntax-highlighting helpers for the XML tool that escape content and emit renderable token markup for the source and output panes.
- [x] 1.2 Refactor `components/tools/xml/xml-tool.tsx` to use layered editor surfaces that preserve textarea editing semantics, keep highlight layers synchronized, and switch the output highlight mode between XML and JSON.

## 2. Expand the responsive workspace

- [x] 2.1 Update `components/tools/xml/xml-tool.module.css` so both panes stretch with the available viewport space and the source/output editor regions remain aligned in the two-column layout.
- [x] 2.2 Adjust stacked-layout sizing and fallback states so editor windows stay roomy on narrow screens while preserving caret visibility, readability, and support content placement.

## 3. Protect the behavior with tests

- [x] 3.1 Extend `tests/integration/xml-tool.test.tsx` to cover source/output syntax highlighting and output-mode switching between XML and JSON.
- [x] 3.2 Extend `tests/e2e/xml-tool.spec.ts` to verify viewport-adaptive editor sizing and visible syntax-highlight rendering for XML and JSON review flows.
