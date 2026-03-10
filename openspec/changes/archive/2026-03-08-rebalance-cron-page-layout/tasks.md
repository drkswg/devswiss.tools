## 1. Cron workflow composition

- [x] 1.1 Recompose `CronTool` so the builder workflow is grouped into the left column and the explainer workflow is grouped into the right column.
- [x] 1.2 Keep each workflow's related validation and result panels inside the same column without changing existing cron processing behavior.

## 2. Responsive layout styling

- [x] 2.1 Update the cron CSS module to use a two-column desktop layout for the workflow groups.
- [x] 2.2 Preserve a single-column stacked layout for smaller screens and ensure the cards remain readable at the collapse breakpoint.

## 3. Verification

- [x] 3.1 Update integration coverage to verify the cron page still exposes both workflows after the layout recomposition.
- [x] 3.2 Update e2e coverage to verify the cron page remains usable for builder and explainer flows after the responsive layout change.
