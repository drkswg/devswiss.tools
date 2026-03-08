## ADDED Requirements

### Requirement: Users can explain a raw cron expression
The cron tool SHALL allow users to submit a raw cron expression with either 5 fields or 6 fields and receive a plain-language explanation on the cron page.

#### Scenario: Explain a valid five-field expression
- **WHEN** the user submits a valid 5-field cron expression
- **THEN** the system displays the normalized expression and a readable explanation of its schedule

#### Scenario: Explain a valid six-field expression
- **WHEN** the user submits a valid 6-field cron expression
- **THEN** the system displays the normalized expression and a readable explanation of its schedule

### Requirement: Users receive validation feedback for invalid cron expressions
The cron tool SHALL reject raw cron expressions that are empty, do not contain 5 or 6 fields, or cannot be interpreted, and it SHALL show an error message that tells the user to correct the expression.

#### Scenario: Empty expression submission
- **WHEN** the user submits the explainer form without entering a cron expression
- **THEN** the system shows a validation error instead of an explanation

#### Scenario: Unsupported field count
- **WHEN** the user submits an expression with fewer than 5 fields or more than 6 fields
- **THEN** the system shows a validation error that the cron expression must use 5 or 6 fields

#### Scenario: Uninterpretable expression
- **WHEN** the user submits a 5-field or 6-field expression that the parser cannot explain
- **THEN** the system shows an error state that the expression could not be interpreted

### Requirement: Cron builder remains available alongside the explainer
The cron tool SHALL continue to support the existing guided cron builder workflow while also exposing the raw-expression explainer on the same page.

#### Scenario: Builder and explainer coexist
- **WHEN** the user opens the cron tool page
- **THEN** the page presents both the guided builder workflow and the raw-expression explainer workflow

#### Scenario: Explainer does not overwrite builder results
- **WHEN** the user generates a cron expression with the builder and then submits a raw expression to the explainer
- **THEN** the explainer result is shown without removing the builder's ability to generate or copy expressions
