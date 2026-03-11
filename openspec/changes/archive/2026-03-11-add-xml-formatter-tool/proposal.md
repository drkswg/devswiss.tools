## Why

The tool catalog is missing an XML utility for a common developer workflow: cleaning up pasted XML, shrinking it for transport, and transforming it into JSON without leaving the browser. Adding a dedicated XML formatter now rounds out the existing text-processing tools and covers a workflow that currently requires multiple external utilities.

## What Changes

- Add a new XML Formatter tool page with a two-pane workspace for original XML input and formatted output.
- Support beautify/format, compact/minify, and XML-to-JSON actions against pasted or uploaded XML content.
- Let users copy content from either pane, choose 2-space, 3-space, or 4-space indentation for formatted XML, upload an XML file into the input pane, and download the formatted XML result.
- Surface validation feedback for malformed XML and prevent invalid content from producing misleading formatted or converted output.

## Capabilities

### New Capabilities
- `xml-formatter`: Format, minify, convert, import, and export XML content in a browser-based two-pane tool workflow.

### Modified Capabilities
- None.

## Impact

- Affected UI: `app/tools/xml/page.tsx` and `components/tools/xml/*`
- Affected registry and metadata: `lib/tools/registry.ts` and related tool metadata helpers
- Affected processing: new browser-first XML parsing, formatting, and conversion helpers in `lib/tools/processors/*`
- Affected test coverage: unit, integration, and e2e coverage for XML formatting, validation, upload/download, and conversion flows
- Dependency impact: reuse browser APIs for file handling and XML parsing where possible; no external service is required
