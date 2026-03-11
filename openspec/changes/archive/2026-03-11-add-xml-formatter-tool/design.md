## Context

The current DevTools catalog includes browser-first utilities for UUID, Base64, hash generation, and cron workflows, but it does not offer an XML-focused tool. New tools are registered through `createToolDefinition`, rendered as dedicated App Router pages, and implemented as client-side components with processor helpers and layered test coverage. The XML formatter needs to fit that pattern while adding a richer workflow than the current single-result tools: dual panes, multiple transform actions, file import/export, and deterministic XML-to-JSON conversion.

The existing tool contract is also strict about action modes, so adding XML operations will require extending the registry enums rather than inserting loosely named actions. The implementation should stay browser-first, avoid server round-trips, and provide clear validation feedback for malformed XML without destroying the user’s original input.

## Goals / Non-Goals

**Goals:**
- Add a dedicated `/tools/xml` route and registry entry for an XML Formatter tool.
- Provide a two-pane workspace with source XML on the left and derived output on the right.
- Support explicit `Format XML`, `Minify XML`, and `Convert to JSON` actions on valid XML input.
- Let users choose 2-space, 3-space, or 4-space indentation for beautified XML output.
- Support copying either pane, uploading XML from a local file into the source pane, and downloading XML output when the current result is XML.
- Centralize XML parsing, validation, formatting, and conversion logic in testable helpers.

**Non-Goals:**
- Round-tripping JSON back into XML.
- Full preservation of every XML construct in JSON form, such as comments, processing instructions, or DTD declarations.
- Streaming or chunked processing for very large XML documents.
- Server-side XML transformation or persistence.

## Decisions

Add the XML formatter as a standalone tool route and component set.
Rationale: the requested workflow is a distinct tool, not a small extension of an existing page. A dedicated route keeps catalog navigation, metadata, and tests aligned with the existing tool architecture.
Alternative considered: fold XML formatting into an existing text-processing tool. Rejected because the catalog already models separate tool domains and XML needs its own processor, validation, and UI behaviors.

Implement XML parsing and normalization in a browser-first processor layer using `DOMParser` plus explicit parse-error detection.
Rationale: `DOMParser` is available in the browser and test environment, keeps the feature dependency-light, and allows the tool to remain entirely client-side. A processor module can normalize line endings, detect malformed XML through `parsererror` nodes, and return structured result states for the UI.
Alternative considered: introduce an external XML parsing package. Rejected because the required behaviors are achievable with platform APIs and the extra dependency is not justified for this scope.

Use explicit transform actions with a shared result model instead of live-updating output on every keystroke.
Rationale: XML documents are often pasted in large blocks, and parse errors during intermediate edits would create noisy feedback. Explicit actions match the project’s current tool interaction pattern and make it clear whether the user wants formatted XML, minified XML, or JSON output.
Alternative considered: transform on input change. Rejected because it would increase render and parse churn while making validation timing less predictable.

Represent XML-to-JSON output with a deterministic object mapping that preserves structure, attributes, text, and repeated siblings.
Rationale: XML-to-JSON conversion is inherently opinionated, so the tool needs one documented representation to keep user expectations and tests stable. The processor should map attributes under `@attributes`, text nodes under `#text`, and repeated sibling elements to arrays before pretty-printing the JSON output.
Alternative considered: flatten all text-only elements to bare strings or use an off-the-shelf XML-to-JSON library. Rejected because both approaches make the output contract less explicit for this codebase.

Keep source input immutable during transforms and expose result-specific actions for copy and download.
Rationale: the user asked for two windows with copy support in both, which implies the original XML must remain available after a transform. The left pane should stay editable source state, the right pane should show the latest derived result, and the download control should only activate when the current result is XML rather than JSON.
Alternative considered: overwrite the source pane with formatted XML. Rejected because it breaks the requested dual-pane workflow and makes source/result comparison impossible.

Extend the tool registry contract with XML-specific action modes while keeping the result kind as text.
Rationale: the current `toolActionMode` enum does not include XML behaviors. Adding `format`, `minify`, and `convert` keeps the registry truthful and avoids overloading unrelated existing modes.
Alternative considered: label all XML actions as `generate`. Rejected because it weakens the registry contract and makes the supported action metadata less meaningful.

Add a small browser download helper for text exports and use native file input plus `File.text()` for imports.
Rationale: the repo already has a clipboard helper but no download utility. A dedicated helper keeps DOM-only logic out of the processor layer and makes it easier to test component behavior around export availability.
Alternative considered: inline download logic inside the tool component. Rejected because the blob/object-URL lifecycle is easier to reason about in a focused utility.

## Risks / Trade-offs

[XML-to-JSON is lossy compared with the original document model] -> Document and test a stable conversion contract that preserves element names, attributes, text nodes, and repeated siblings, while explicitly excluding comments and other advanced constructs.

[Browser XML parsing differences across environments] -> Detect parser failures via normalized `parsererror` checks and cover malformed-input cases with unit and integration tests.

[Large pasted documents can make repeated transforms feel expensive] -> Keep transforms user-triggered, not reactive on every keystroke, and avoid duplicate parsing work inside the UI layer.

[Download and file input are browser-only APIs] -> Restrict import/export interactions to the client component and validate them through integration and Playwright coverage rather than server logic.

## Migration Plan

This change is additive. Ship the new route, registry entry, and tests together. No data migration or rollback procedure beyond reverting the feature is required.

## Open Questions

- None at proposal time. The current feature set is specific enough to implement without blocking decisions.
