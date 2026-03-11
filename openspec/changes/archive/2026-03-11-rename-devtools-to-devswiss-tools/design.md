## Context

The current repository uses the `DevTools` brand across user-facing UI copy, shared metadata constants, the web manifest, package manifests, docs, tests, and a small number of brand-derived code identifiers such as placeholder hostnames and performance-metric globals. The requested change is cross-cutting but intentionally shallow: keep the existing routes, tools, and repository directory path, while replacing project-local branding with `devswiss.tools`.

Because the target brand contains a dot, the implementation needs a clear distinction between display/package strings and identifier-safe code symbols. It also needs a repeatable audit so the old brand does not remain in docs or tests after the app surfaces are updated.

## Goals / Non-Goals

**Goals:**
- Present `devswiss.tools` as the canonical product name across site metadata, manifest data, user-facing copy, docs, and package metadata.
- Replace legacy `DevTools` and `devtools` references in repository-local tests, fixtures, file names, and helper identifiers where they are part of the project brand.
- Preserve existing tool routes, functionality, and browser-first behavior while making the rename easy to verify through repository search and automated tests.
- Define a consistent rule for places where `devswiss.tools` cannot be used verbatim because the surface requires an identifier-safe token.

**Non-Goals:**
- Renaming the top-level project directory.
- Changing public tool slugs, route paths, or information architecture.
- Reworking the visual design, copy tone, or SEO strategy beyond what is necessary for the brand rename.
- Introducing new dependencies or backend behavior.

## Decisions

Use `devswiss.tools` as the canonical display and package string.
Rationale: the user requested a project-wide rename to the exact domain-style brand. This should appear in metadata, manifest fields, docs, README titles, and visible UI copy so the product identity is consistent.
Alternative considered: keep a title-cased display variant such as `DevSwiss Tools`. Rejected because it diverges from the explicit requested brand and creates multiple names to maintain.

Use identifier-safe derivatives only where dots are unsuitable.
Rationale: some code surfaces, such as JS globals, test helper names, and file names, cannot cleanly use `devswiss.tools` verbatim. In those places the implementation should use a predictable derivative such as `devswissTools` or `devswiss-tools` while keeping displayed strings and serialized metadata on the exact `devswiss.tools` name.
Alternative considered: leave legacy `devtools` identifiers unchanged to avoid churn. Rejected because those identifiers are still brand-bearing project-local references and would leave the rename incomplete.

Implement the rename as an audited sweep across branding surface groups.
Rationale: the affected references fall into a few predictable buckets: shared metadata/app shell copy, package manifests, docs/contributor guidance, tests/fixtures, and code-only helper identifiers. Handling them as a grouped audit reduces the chance of missing strings and makes verification straightforward with repository search.
Alternative considered: only update user-visible strings and ignore tests/docs until later. Rejected because the user explicitly requested the rename everywhere in the project except the directory name.

Keep functionality and routes unchanged while updating brand-derived samples.
Rationale: this is a branding change, not a product restructuring. The implementation should preserve route paths and tool behavior, but update placeholders and example values such as hostnames or sample text when they embed the old brand.
Alternative considered: rename route paths or other stable identifiers to match the new domain. Rejected because the request excludes that kind of structural change and it would introduce avoidable regression risk.

## Risks / Trade-offs

[Missed legacy references in low-visibility files] -> Use repository-wide searches for `DevTools`, `devtools`, and file names containing the old brand before and after the edit pass, excluding only the unchanged project directory path.

[The dotted brand is awkward in code identifiers] -> Restrict literal `devswiss.tools` to strings and metadata, and use a documented identifier-safe derivative where syntax or naming conventions require it.

[Package metadata changes can ripple into generated lockfile content] -> Update `package.json` and the generated `package-lock.json` together so package names remain consistent.

[Brand-specific test data can fail even when functionality is unchanged] -> Update tests and fixtures in the same change and run the relevant verification suite after the rename sweep.

## Migration Plan

Ship the rename in one change set that updates shared metadata/constants first, then user-facing copy, package metadata, docs, tests, and leftover brand-derived identifiers. After edits, verify the repository with a final search for legacy brand strings, allowing only the top-level directory name to remain unchanged. No data migration is required. Rollback is a normal revert of the rename change.

## Open Questions

- None. This design assumes the package manifest name is in scope because the user requested the rename everywhere in the project except the directory name.
