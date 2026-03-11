## Why

The XML formatter's source and output textareas currently feel cramped relative to the available tool-page space, especially on larger displays. The two panes also do not keep their editing regions aligned consistently, which makes side-by-side review less efficient.

## What Changes

- Rework the XML formatter layout so the source and output panes use the available viewport more effectively on desktop and large laptop screens.
- Keep the source and output textareas visually aligned so users can compare content across panes without offsets caused by surrounding controls.
- Make the pane and textarea sizing adaptive across breakpoints while preserving the existing upload, transform, copy, and download workflows.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `xml-formatter`: tighten the two-pane workspace requirements so the XML tool keeps aligned source and output editors and scales the workspace to the current screen size.

## Impact

- `components/tools/xml/xml-tool.tsx`
- `components/tools/xml/xml-tool.module.css`
- `tests/integration/xml-tool.test.tsx`
- `tests/e2e/xml-tool.spec.ts`
- `openspec/specs/xml-formatter/spec.md`
