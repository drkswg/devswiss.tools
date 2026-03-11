# site-branding Specification

## Purpose
TBD - created by archiving change rename-devtools-to-devswiss-tools. Update Purpose after archive.
## Requirements
### Requirement: Application branding uses devswiss.tools across metadata and shell copy
The application SHALL identify itself as `devswiss.tools` in shared site metadata, manifest metadata, and global app-shell copy that names the product.

#### Scenario: User loads a page with site metadata
- **WHEN** the user opens the homepage or any tool route
- **THEN** page metadata and manifest fields that identify the application use `devswiss.tools`

#### Scenario: User reaches a global boundary page
- **WHEN** the user lands on a global error page or the global not-found page
- **THEN** the product-name copy on that page refers to `devswiss.tools`

### Requirement: Product copy and brand-derived examples avoid the legacy name
The project SHALL replace legacy `DevTools` and `devtools` references in user-visible tool copy and brand-derived example values with `devswiss.tools` or an identifier-safe derivative of that brand.

#### Scenario: User reads product copy
- **WHEN** the user views the homepage or a tool workflow that mentions the product name
- **THEN** the visible copy refers to `devswiss.tools` instead of the legacy brand

#### Scenario: User sees sample content derived from the product name
- **WHEN** a tool renders placeholder text or example values that embed the project brand
- **THEN** those values use `devswiss.tools` or an identifier-safe derivative based on the new brand

### Requirement: Repository-local metadata and automated checks stay aligned with the new brand
The repository SHALL keep package metadata, documentation, tests, fixtures, and project-local helper identifiers aligned with `devswiss.tools` so contributors and automated checks do not reintroduce the old brand.

#### Scenario: Contributor inspects repository metadata
- **WHEN** a contributor reads package manifests or project documentation
- **THEN** those files identify the project as `devswiss.tools`, excluding the unchanged top-level directory name

#### Scenario: Automated checks exercise branded content
- **WHEN** automated tests or helper code use project-brand strings or identifiers
- **THEN** they use `devswiss.tools` or an identifier-safe derivative of the new brand

