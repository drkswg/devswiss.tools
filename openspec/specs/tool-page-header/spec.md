# tool-page-header Specification

## Purpose
TBD - created by archiving change compact-tool-page-header. Update Purpose after archive.
## Requirements
### Requirement: Tool pages show a compact summary header
The system SHALL render every tool page with a shared header that presents the tool title and a concise summary of what the tool does without additional helper-copy sections.

#### Scenario: User opens a tool page
- **WHEN** the user navigates to any tool route
- **THEN** the top page section shows the tool title
- **AND** the same section shows a concise summary line describing the tool's primary purpose
- **AND** the section does not render an extra helper text block beneath the summary

### Requirement: Tool pages preserve navigation actions in the header
The system SHALL keep the existing navigation controls visible within the compact tool-page header so users can move back to the catalog or forward to the next tool without scrolling.

#### Scenario: User scans header navigation
- **WHEN** the user opens a tool page
- **THEN** the header shows a control to return to the tool catalog
- **AND** the header shows the existing next-tool control for that route

