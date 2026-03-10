## ADDED Requirements

### Requirement: Cron workflows use a responsive two-column layout
The cron tool SHALL present the guided cron builder and raw-expression explainer as two grouped workflows. On wide viewports, the builder workflow SHALL appear in the left column and the explainer workflow SHALL appear in the right column. On narrow viewports, the workflows SHALL stack into a single column.

#### Scenario: Wide viewport shows builder left and explainer right
- **WHEN** the user opens the cron tool on a wide viewport
- **THEN** the guided builder workflow is shown in the left column and the explainer workflow is shown in the right column

#### Scenario: Each workflow keeps related panels together
- **WHEN** the user views the cron tool layout
- **THEN** each workflow keeps its inputs, validation feedback, and results grouped within the same column rather than separated into distant page sections

#### Scenario: Narrow viewport stacks workflows
- **WHEN** the user opens the cron tool on a narrow viewport
- **THEN** the builder and explainer workflows are shown in a single-column stack without losing access to either workflow
