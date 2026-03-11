## Why

The repository still identifies the product as DevTools across the app shell, metadata, package manifests, docs, and tests. Renaming those project-local references to `devswiss.tools` now keeps the shipped brand consistent before additional features and docs spread the old name further.

## What Changes

- Replace project-local `DevTools` and `devtools` branding references with `devswiss.tools`, except for the top-level project directory name.
- Update user-facing app copy, metadata, manifest names, and tool descriptions that currently present the old product name.
- Rename package metadata, documentation, test descriptions, sample values, and fixtures so local examples and assertions match `devswiss.tools`.
- Audit internal brand-derived identifiers and rename them where they are repository-local, including performance-metric globals and sample hostnames/messages.
- Preserve existing tool routes, browser-local behavior, and the repository directory path; this change is a branding update rather than a functional redesign.

## Capabilities

### New Capabilities
- `site-branding`: Keep application metadata, user-facing copy, package metadata, documentation, and repository-local brand identifiers aligned on `devswiss.tools`.

### Modified Capabilities
- None.

## Impact

- Affected UI: homepage hero copy, shared metadata helpers, tool descriptions, and global error/not-found surfaces
- Affected metadata and packaging: `app/manifest.ts`, `package.json`, `package-lock.json`, and related site-name constants
- Affected tests and fixtures: integration, unit, and e2e files that assert or generate brand-specific strings
- Affected docs and contributor guidance: `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, and other repository documentation
- Dependency impact: none; this is a repo-local rename with no new runtime or build dependencies
