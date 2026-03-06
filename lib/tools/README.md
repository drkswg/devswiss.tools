# Tool Registry Maintenance

Use this workflow whenever you introduce a new tool tile.

## 1. Create the tool definition

Add an entry in [`lib/tools/registry.ts`](/c/Users/kodia/IdeaProjects/DevTools/lib/tools/registry.ts)
with `createToolDefinition(...)`.

Required values:

- `slug` (lowercase letters, numbers, hyphens)
- `name`
- `description`
- `iconKey`
- `accentToken`
- `order`

`createToolDefinition` will:

- default `id` to `slug`
- default `routePath` to `/tools/<slug>`
- default `status` to `active`
- validate schema compatibility
- verify each `supportedActions[].toolId` matches the tool id

## 2. Add a route page

Create `app/tools/<slug>/page.tsx` and call `buildToolMetadata(tool)` using the registry entry.
Use the shared `ToolPageShell` and existing UI primitives.

## 3. Implement tool behavior

Add processing and validation modules under:

- `lib/tools/processors/`
- `lib/validation/`

Keep processing browser-only for the frontend-only architecture.

## 4. Add and run quality checks

- unit test for processing and validation behavior
- integration test for the tool component journey
- e2e test for routing, copy/feedback, and accessibility smoke

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## 5. Verify catalog consistency

After adding a tool:

- homepage tile appears with the same icon-tile treatment
- tile link and direct route both work
- ordering remains stable by `order`
- existing tool tiles and labels remain unchanged
