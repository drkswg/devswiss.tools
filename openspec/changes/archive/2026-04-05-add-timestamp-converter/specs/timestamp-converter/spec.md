## ADDED Requirements

### Requirement: Timestamp converter is available as a dedicated tool
The system SHALL expose a dedicated `Timestamp Converter` tool in the registry-driven catalog and render it on its own tool route within the shared tool-page shell.

#### Scenario: User discovers the timestamp tool
- **WHEN** the user views the tool catalog
- **THEN** the catalog shows a `Timestamp Converter` entry with copy describing browser-local Unix timestamp conversion

#### Scenario: User opens the timestamp tool route
- **WHEN** the user navigates to the timestamp tool page
- **THEN** the page renders the shared tool header for `Timestamp Converter`
- **AND** the page shows controls for explaining timestamps and converting date/time values

### Requirement: Timestamp converter explains Unix timestamps with unit clarity
The system SHALL accept signed Unix timestamp input in seconds or milliseconds, resolve the unit from the selected or detected mode, and return readable date and time details for the interpreted instant.

#### Scenario: User explains a seconds timestamp
- **WHEN** the user submits a valid timestamp resolved as seconds
- **THEN** the tool shows that the resolved unit is seconds
- **AND** the tool returns a readable UTC date and time for that instant

#### Scenario: User explains a milliseconds timestamp
- **WHEN** the user submits a valid timestamp resolved as milliseconds
- **THEN** the tool shows that the resolved unit is milliseconds
- **AND** the tool returns a readable UTC date and time for that instant

### Requirement: Timestamp converter converts date/time input into Unix timestamps
The system SHALL let users convert an entered date/time value into a Unix timestamp using an explicit timezone interpretation and an explicit output unit of seconds or milliseconds.

#### Scenario: User generates a seconds timestamp from UTC date/time
- **WHEN** the user enters a valid date/time value, selects `UTC`, and selects seconds output
- **THEN** the tool returns the corresponding Unix timestamp in seconds

#### Scenario: User generates a milliseconds timestamp from local date/time
- **WHEN** the user enters a valid date/time value, selects `Local`, and selects milliseconds output
- **THEN** the tool returns the corresponding Unix timestamp in milliseconds

### Requirement: Timestamp converter rejects invalid requests with actionable feedback
The system SHALL reject empty, malformed, or out-of-range timestamp inputs and incomplete date/time submissions, and it SHALL show actionable validation feedback instead of a misleading result.

#### Scenario: User submits an invalid raw timestamp
- **WHEN** the user submits an empty or non-integer timestamp value
- **THEN** the tool shows validation feedback on the timestamp input
- **AND** the tool does not present a new explanation result

#### Scenario: User submits an incomplete date/time value
- **WHEN** the user submits the date/time conversion form without a valid date/time value
- **THEN** the tool shows validation feedback on the date/time input
- **AND** the tool does not present a new timestamp result

#### Scenario: User submits an out-of-range timestamp
- **WHEN** the user submits a timestamp that cannot be represented as a valid JavaScript date
- **THEN** the tool shows an error state that the value is outside the supported range

### Requirement: Timestamp converter supports copying the latest valid timestamp
The system SHALL let users copy the latest successfully generated timestamp through the shared result workflow.

#### Scenario: User copies a generated timestamp
- **WHEN** the user activates copy after a valid date/time to timestamp conversion
- **THEN** the tool copies the timestamp to the clipboard
- **OR** the tool explains that clipboard access is unavailable
