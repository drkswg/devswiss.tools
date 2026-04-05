# regex-tester Specification

## Purpose
TBD - created by archiving change add-regex-tool. Update Purpose after archive.
## Requirements
### Requirement: Regex tester is available as a dedicated tool with flavor selection
The system SHALL expose a dedicated `Regex Tester` tool in the registry-driven catalog and render it on its own tool route within the shared tool-page shell. The tool SHALL let the user choose a supported regex flavor of `Java` or `PL/SQL` before analyzing a pattern.

#### Scenario: User discovers the regex tool
- **WHEN** the user views the tool catalog
- **THEN** the catalog shows a `Regex Tester` entry with copy describing flavor-aware regex analysis

#### Scenario: User opens the regex tool route
- **WHEN** the user navigates to the regex tool page
- **THEN** the page renders the shared tool header for `Regex Tester`
- **AND** the page shows inputs for regex flavor, regex expression, and sample text

### Requirement: Regex tester explains patterns according to the selected flavor
The system SHALL analyze the entered regex expression according to the selected flavor and generate a structured explanation that identifies notable tokens, groups, classes, anchors, quantifiers, and flavor-specific caveats relevant to the expression.

#### Scenario: User explains a Java regex
- **WHEN** the user selects `Java` and submits a valid Java-compatible regex expression
- **THEN** the tool returns a structured explanation for the pattern
- **AND** the explanation reflects Java-oriented constructs present in the expression

#### Scenario: User explains a PL/SQL regex
- **WHEN** the user selects `PL/SQL` and submits a valid PL/SQL-compatible regex expression
- **THEN** the tool returns a structured explanation for the pattern
- **AND** the explanation reflects PL/SQL-oriented constructs present in the expression

### Requirement: Regex tester reports sample match status and details
The system SHALL evaluate the current sample text against a supported expression for the selected flavor and report whether any match exists, whether the full sample matches, and match details including matched text positions and captured groups when present.

#### Scenario: Sample text fully matches the expression
- **WHEN** the user submits a supported expression and sample text that fully matches the pattern
- **THEN** the tool reports that a match exists
- **AND** the tool reports that the full sample matches the expression
- **AND** the tool shows match details for the successful evaluation

#### Scenario: Sample text has only a partial match
- **WHEN** the user submits a supported expression and sample text that contains a matching substring but does not fully match the pattern
- **THEN** the tool reports that a match exists
- **AND** the tool reports that the full sample does not match the expression
- **AND** the tool shows match details for the matching substring

#### Scenario: Sample text does not match the expression
- **WHEN** the user submits a supported expression and sample text with no match
- **THEN** the tool reports that no match exists
- **AND** the tool does not present stale match details from a previous successful run

### Requirement: Regex tester rejects invalid or unsupported expressions with actionable feedback
The system SHALL reject malformed expressions and selected-flavor constructs that the browser-local execution layer cannot support exactly, and it SHALL show actionable feedback instead of misleading match output.

#### Scenario: User submits an invalid expression
- **WHEN** the user submits an empty or malformed regex expression
- **THEN** the tool shows validation feedback on the expression input
- **AND** the tool does not present a new explanation or match result

#### Scenario: User submits a flavor-specific construct outside the supported execution subset
- **WHEN** the user submits an expression that is valid for the selected flavor but cannot be executed safely in the browser-local engine
- **THEN** the tool explains that the construct is outside the supported execution subset for that flavor
- **AND** the tool does not present misleading match output

