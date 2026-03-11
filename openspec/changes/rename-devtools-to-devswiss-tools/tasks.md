## 1. Shared branding surfaces

- [x] 1.1 Update shared branding constants, manifest metadata, and global boundary copy to present `devswiss.tools` as the application name.
- [x] 1.2 Rename package metadata and project-local brand-derived identifiers, including lockfile entries and helper symbols that currently use `DevTools` or `devtools`.

## 2. Content and documentation

- [x] 2.1 Replace legacy brand references in homepage/tool copy, placeholders, sample values, and other user-visible text with `devswiss.tools` or an identifier-safe derivative.
- [x] 2.2 Update repository documentation and contributor guidance files to use `devswiss.tools` everywhere except the unchanged top-level project directory name.

## 3. Test and audit coverage

- [x] 3.1 Update unit, integration, and e2e tests, fixtures, and performance helpers so brand-specific assertions and sample inputs align with the new name.
- [x] 3.2 Run a repository-wide audit plus the relevant automated checks to confirm no legacy brand references remain outside the intentionally unchanged directory path.
