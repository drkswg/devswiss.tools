## 1. Processor and validation

- [x] 1.1 Add a raw cron expression validation path that trims input, enforces 5-field or 6-field expressions, and returns structured error states.
- [x] 1.2 Refactor cron explanation helpers so the builder and explainer can share summary generation and parser error handling.

## 2. Cron page UI

- [x] 2.1 Add a dedicated explainer panel to the cron tool that accepts a pasted cron expression and submits it independently from the builder workflow.
- [x] 2.2 Render explainer results and validation feedback without breaking the existing builder result and copy interaction.

## 3. Verification

- [x] 3.1 Add unit tests for valid and invalid raw cron expression explanation cases, including 5-field and 6-field inputs.
- [x] 3.2 Update integration and e2e coverage to verify the cron page shows both workflows and explains pasted expressions correctly.
