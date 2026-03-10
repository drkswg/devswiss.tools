## 1. Shared header simplification

- [x] 1.1 Update `ToolPageShell` to remove the helper-text section from the shared tool-page header API and render only the title, concise description, and actions.
- [x] 1.2 Tighten the tool-page header spacing and typography in `tool-page-shell.module.css` so the first block is visibly more compact on desktop and mobile layouts.

## 2. Tool page adoption

- [x] 2.1 Remove `helperText` usage from each tool route under `app/tools/` so every tool page relies on the shared compact summary header.
- [x] 2.2 Verify each tool page still surfaces the expected back-to-catalog and next-tool navigation controls in the header.

## 3. Verification

- [x] 3.1 Update shared integration or e2e coverage to assert tool pages expose their heading, concise summary, and header navigation without the extra helper block.
- [x] 3.2 Run the relevant test suite for tool-page routing and header behavior after the shared shell change.
