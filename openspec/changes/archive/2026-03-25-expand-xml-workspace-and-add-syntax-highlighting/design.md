## Context

The current XML formatter already uses a two-pane layout, but the panes still reserve noticeable unused space around the primary text windows. The source and output editors remain bounded by relatively compact height rules, so the page stops short of using the available viewport on larger screens. The tool also renders both panes as plain `<textarea>` content, which preserves editing and copy behavior but gives users no visual help when scanning nested XML or converted JSON.

This change stays inside the XML tool UI. It must preserve browser-local transforms, uploads, copy and download actions, keyboard editing, and the existing labeled textarea semantics that the current tests and accessibility checks depend on.

## Goals / Non-Goals

**Goals:**
- Make the source and output editor regions consume the available pane height and width more aggressively across desktop, tablet, and stacked mobile layouts.
- Keep the source and output editors visually aligned in the two-column layout while allowing both panes to stretch with the viewport.
- Add syntax highlighting for XML in the source pane and for XML or JSON in the output pane without breaking textarea editing, selection, copy, or accessibility behavior.
- Keep the implementation local to the XML tool component/CSS module and extend test coverage for layout and highlighting regressions.

**Non-Goals:**
- Replacing the XML formatter with a full IDE-style editor such as Monaco or CodeMirror.
- Adding line numbers, code folding, search, or manual split-pane resizing.
- Changing XML validation, transform rules, file formats, or output download behavior.
- Creating a shared syntax-highlighting framework for unrelated tools in this change.

## Decisions

1. Use a layered textarea-plus-highlight surface instead of replacing the editors.
   Each editor window will keep a real `<textarea>` for input, focus, labels, keyboard interaction, clipboard behavior, and test compatibility. A synchronized, `aria-hidden` highlight layer will render beneath it using escaped HTML spans for XML or JSON tokens.

   Alternative considered: add a third-party code editor. Rejected because it is heavier than the current tool surface, adds integration and styling complexity to a single-tool workflow, and risks changing accessibility and clipboard behavior more than necessary.

   Alternative considered: replace the textarea with a read/write `contenteditable` region. Rejected because it is harder to keep predictable for keyboard editing, selection, and form-style labeling.

2. Add lightweight, local tokenizers for XML and JSON.
   The highlighting layer should be driven by simple browser-side tokenization helpers dedicated to the XML tool. XML highlighting can classify declarations, comments, tag brackets, element names, attribute names, attribute values, and text nodes. JSON highlighting can classify punctuation, property keys, strings, numbers, booleans, and `null`. All rendered content must be escaped before injection.

   Alternative considered: CSS-only highlighting without tokenization. Rejected because plain textareas cannot style syntax categories by themselves.

   Alternative considered: a generic highlighting dependency. Rejected for now because the change only needs XML and JSON support, and a local tokenizer keeps the footprint smaller and behavior easier to control.

3. Make the editor region the dominant, flexible row in each pane.
   The pane layout should continue using matching source/output cards, but the editor region will become the row that expands to fill leftover height. The pane and editor min/max sizes should be driven by viewport-aware `clamp(...)` rules so the editors can use nearly the full tool-page height on wide screens while remaining bounded on shorter or stacked layouts.

   Alternative considered: only increase the textarea `min-height`. Rejected because it still leaves large amounts of unused space on tall viewports and does not guarantee that the editor remains the primary consumer of available pane height.

4. Keep the highlight layer visually locked to the textarea.
   The highlight layer and textarea must share the same font, line-height, letter spacing, padding, white-space mode, and scroll position. The editable textarea text can be made transparent while keeping caret visibility, so users see the highlight layer but still type into the real form control. Read-only output can use the same structure to keep XML and JSON rendering visually consistent.

   Alternative considered: highlight only the read-only output pane. Rejected because the request explicitly calls for syntax highlighting in the source window as well.

5. Protect the UX with focused integration and browser tests.
   Integration coverage should assert that the XML tool renders highlight layers for source and output content and that XML-to-JSON switching updates the output highlight mode. Playwright coverage should continue checking aligned editor positions and add assertions that the wide layout editors occupy most of their pane height and that highlight markup is present after XML and JSON flows.

## Risks / Trade-offs

- [Highlight layer and textarea drift out of sync] → Keep typography and spacing in a shared editor-surface class and synchronize scroll positions directly between the textarea and highlight layer.
- [Large XML documents make re-highlighting feel slow while typing] → Keep tokenization linear, cap inputs with the existing shared validation limit, and use deferred rendering for highlight updates if typing responsiveness drops.
- [Transparent textarea text reduces readability in forced-colors or unsupported modes] → Fall back to plain visible textarea text when the highlight surface cannot render reliably, including accessibility-focused browser modes.
- [Viewport-filling panes become too tall on narrow screens] → Use breakpoint-specific clamps so stacked mobile panes still feel roomy without dominating the full page length.

## Migration Plan

This is a UI-only change with no stored data or route migration. Rollout is a normal deploy of the XML tool component, styles, and tests. If regressions appear, rollback is a standard revert of the XML tool UI change set.

## Open Questions

None.
