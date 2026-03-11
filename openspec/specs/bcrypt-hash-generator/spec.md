## ADDED Requirements

### Requirement: Bcrypt hash generator is available as a dedicated tool
The system SHALL expose a dedicated `Bcrypt Hash Generator` tool in the registry-driven catalog and render it on its own tool route within the shared tool-page shell.

#### Scenario: User discovers the bcrypt tool
- **WHEN** the user views the tool catalog
- **THEN** the catalog shows a `Bcrypt Hash Generator` entry with copy describing browser-local bcrypt hashing

#### Scenario: User opens the bcrypt tool route
- **WHEN** the user navigates to the bcrypt tool page
- **THEN** the page renders the shared tool header for `Bcrypt Hash Generator`
- **AND** the page shows controls for plain-text input, bcrypt rounds, and hash generation

### Requirement: Bcrypt hash generator creates salted hashes with configurable rounds
The system SHALL let users generate bcrypt hashes locally in the browser from plain text using a user-selected rounds value from `1` through `20`, and the generated output SHALL encode the selected work factor in bcrypt hash format.

#### Scenario: User reviews the rounds control
- **WHEN** the user views the bcrypt generator form
- **THEN** the tool exposes a rounds control that allows values from `1` through `20`

#### Scenario: User generates a bcrypt hash
- **WHEN** the user submits plain text with a valid rounds value
- **THEN** the tool returns a bcrypt hash string generated in the browser
- **AND** the returned hash includes the selected rounds value in bcrypt format

### Requirement: Bcrypt hash generator explains salted output behavior
The system SHALL explain that bcrypt hashes are salted so the same plain text and rounds value can produce different valid outputs across repeated generations.

#### Scenario: User reads bcrypt guidance
- **WHEN** the user views the bcrypt tool before or after generating a hash
- **THEN** the page includes guidance that bcrypt uses a fresh salt
- **AND** the guidance states that repeated submissions can yield different hashes even when the input and rounds do not change

### Requirement: Bcrypt hash generator rejects invalid requests with actionable feedback
The system SHALL reject empty plain text and rounds values outside the supported `1` to `20` range, and it SHALL show actionable validation feedback instead of producing a misleading result.

#### Scenario: User submits an empty value
- **WHEN** the user triggers hash generation without entering plain text
- **THEN** the tool shows a validation error that input is required

#### Scenario: User submits rounds outside the supported range
- **WHEN** the user triggers hash generation with a rounds value lower than `1` or higher than `20`
- **THEN** the tool shows a validation error describing the supported rounds range
- **AND** the tool does not present a new hash result

### Requirement: Bcrypt hash generator supports copying the latest valid hash
The system SHALL let users copy the latest successfully generated bcrypt hash through the shared result workflow.

#### Scenario: User copies a generated bcrypt hash
- **WHEN** the user activates copy after a valid bcrypt hash is generated
- **THEN** the tool copies the hash to the clipboard
- **OR** the tool explains that clipboard access is unavailable
