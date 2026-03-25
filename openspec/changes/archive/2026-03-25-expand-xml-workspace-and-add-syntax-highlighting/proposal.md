## Why

The XML formatter still leaves too much unused screen space around its source and output editors, especially on larger displays, which makes side-by-side review harder than it needs to be. The tool also shows raw plain text only, so XML and JSON structure are harder to scan when users are reviewing large documents.

## What Changes

- Expand the XML tool workspace so the source and output editor regions grow with the viewport and claim the available height and width inside each pane.
- Ensure the primary XML and result windows remain aligned and visually dominant across desktop, tablet, and stacked mobile layouts instead of stopping at a relatively compact fixed size.
- Add browser-side syntax highlighting for XML and JSON content in the source and output windows while preserving the current transform, copy, upload, and download workflows.
- Extend automated coverage so responsive sizing and syntax-highlight rendering remain protected against layout regressions.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `xml-formatter`: expand the workspace requirements so XML editor panes fill the available screen space more effectively and render XML/JSON with syntax highlighting in both the source and transformed-result windows.

## Impact

- `components/tools/xml/*`
- `tests/integration/xml-tool.test.tsx`
- `tests/e2e/xml-tool.spec.ts`
- `openspec/specs/xml-formatter/spec.md`
