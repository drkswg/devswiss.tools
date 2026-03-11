## 1. Restructure the XML workspace

- [x] 1.1 Update `components/tools/xml/xml-tool.tsx` so the source and output panes share a matching vertical structure that keeps the primary text windows aligned in the two-column layout.
- [x] 1.2 Reposition the source/output controls, status, and feedback within that new structure without changing the existing XML transform, upload, copy, download, or accessibility behavior.

## 2. Make the panes adaptive

- [x] 2.1 Update `components/tools/xml/xml-tool.module.css` so the two-pane layout stretches evenly on desktop and large-tablet viewports and keeps the text windows aligned.
- [x] 2.2 Replace the fixed textarea sizing with responsive height rules that expand with available viewport space and collapse cleanly to full-width stacked panes on narrow screens.

## 3. Protect the layout behavior

- [x] 3.1 Extend `tests/e2e/xml-tool.spec.ts` to assert aligned source/output textarea positions in the wide two-column layout.
- [x] 3.2 Update `tests/e2e/xml-tool.spec.ts` and any impacted integration selectors so the responsive stacked layout and existing XML workflows remain covered after the markup changes.
