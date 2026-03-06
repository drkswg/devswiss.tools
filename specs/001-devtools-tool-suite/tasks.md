# Tasks: DevTools Tool Suite

**Input**: Design documents from `/specs/001-devtools-tool-suite/`
**Prerequisites**: [plan.md](/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/plan.md), [spec.md](/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/spec.md), [research.md](/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/research.md), [data-model.md](/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/data-model.md), `contracts/`

**Tests**: Test tasks are REQUIRED for affected behavior. Include unit, integration, and e2e coverage for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Path Conventions

- Frontend-only Next.js app: `app/`, `components/`, `lib/`, `styles/`, `public/`, `tests/`
- Tests convention: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Shared browser-only processing lives in `lib/tools/processors/` and `lib/validation/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js workspace, toolchain, and automated quality gates.

- [X] T001 Initialize the Next.js application workspace and scripts in `/c/Users/kodia/IdeaProjects/DevTools/package.json`
- [X] T002 Configure TypeScript, path aliases, and Next.js defaults in `/c/Users/kodia/IdeaProjects/DevTools/tsconfig.json` and `/c/Users/kodia/IdeaProjects/DevTools/next.config.ts`
- [X] T003 [P] Configure ESLint flat config and npm lint/typecheck scripts in `/c/Users/kodia/IdeaProjects/DevTools/eslint.config.mjs`
- [X] T004 [P] Configure Vitest, Testing Library setup, and jsdom test bootstrap in `/c/Users/kodia/IdeaProjects/DevTools/vitest.config.ts` and `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/setup.ts`
- [X] T005 [P] Configure Playwright and axe accessibility support in `/c/Users/kodia/IdeaProjects/DevTools/playwright.config.ts` and `/c/Users/kodia/IdeaProjects/DevTools/tests/e2e/fixtures.ts`
- [X] T006 Add CI quality gates for lint, typecheck, unit, build, and e2e runs in `/c/Users/kodia/IdeaProjects/DevTools/.github/workflows/ci.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared design, routing, registry, and accessibility foundations before story work starts.

**⚠️ CRITICAL**: No user-story implementation starts until this phase is complete.

- [X] T007 Define IntelliJ-inspired color, spacing, radius, and typography tokens in `/c/Users/kodia/IdeaProjects/DevTools/styles/tokens.css` and `/c/Users/kodia/IdeaProjects/DevTools/styles/globals.css`
- [X] T008 [P] Implement the root layout, font loading, and site metadata in `/c/Users/kodia/IdeaProjects/DevTools/app/layout.tsx` and `/c/Users/kodia/IdeaProjects/DevTools/app/manifest.ts`
- [X] T009 [P] Implement global error and not-found boundaries in `/c/Users/kodia/IdeaProjects/DevTools/app/global-error.tsx` and `/c/Users/kodia/IdeaProjects/DevTools/app/global-not-found.tsx`
- [X] T010 [P] Create shared tile, button, field, and status primitives in `/c/Users/kodia/IdeaProjects/DevTools/components/ui/icon-tile.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/ui/button.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/ui/form-field.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/ui/status-message.tsx`
- [X] T011 [P] Define typed tool contracts, icon mapping, and registry helpers in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/contracts.ts`, `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/icon-map.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/metadata.ts`, and `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/registry.ts`
- [X] T012 [P] Implement shared validation and browser utility helpers in `/c/Users/kodia/IdeaProjects/DevTools/lib/validation/common.ts`, `/c/Users/kodia/IdeaProjects/DevTools/lib/utils/clipboard.ts`, and `/c/Users/kodia/IdeaProjects/DevTools/lib/utils/text.ts`
- [X] T013 Implement the reusable tool page shell and catalog section scaffolding in `/c/Users/kodia/IdeaProjects/DevTools/components/tool-shell/tool-page-shell.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/tool-shell/tool-page-shell.module.css`, `/c/Users/kodia/IdeaProjects/DevTools/components/marketing/tool-catalog.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/marketing/tool-catalog.module.css`
- [X] T014 Add shared render helpers and route test utilities in `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/test-utils.tsx` and `/c/Users/kodia/IdeaProjects/DevTools/tests/integration/test-utils.tsx`

**Checkpoint**: Foundation complete. User stories can now proceed with stable contracts and shared UI.

---

## Phase 3: User Story 1 - Use the core developer tools (Priority: P1) 🎯 MVP

**Goal**: Deliver the homepage catalog and the UUID, Base64, and Hash tools with responsive, keyboard-accessible flows and copyable outputs.

**Independent Test**: A user can open `/`, navigate to `/tools/uuid`, `/tools/base64`, and `/tools/hash`, complete a successful action in each, receive validation feedback, and copy a generated result without any account setup.

### Tests for User Story 1

- [X] T015 [P] [US1] Add unit coverage for UUID, Base64, and Hash browser processors in `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/tools/uuid-processor.test.ts`, `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/tools/base64-processor.test.ts`, and `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/tools/hash-processor.test.ts`
- [X] T016 [P] [US1] Add integration coverage for the homepage catalog and core tool journeys in `/c/Users/kodia/IdeaProjects/DevTools/tests/integration/devtools-catalog.test.tsx` and `/c/Users/kodia/IdeaProjects/DevTools/tests/integration/core-tools.test.tsx`
- [X] T017 [P] [US1] Add end-to-end smoke and accessibility coverage for the homepage, UUID, Base64, and Hash flows in `/c/Users/kodia/IdeaProjects/DevTools/tests/e2e/core-tools.spec.ts`

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement the homepage hero and catalog route in `/c/Users/kodia/IdeaProjects/DevTools/app/page.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/marketing/hero.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/marketing/hero.module.css`
- [X] T019 [P] [US1] Register the initial catalog entries for UUID, Base64, Hash, and Cron in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/registry.ts`
- [X] T020 [P] [US1] Implement UUID processing and schema validation in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/processors/uuid.ts` and `/c/Users/kodia/IdeaProjects/DevTools/lib/validation/uuid.ts`
- [X] T021 [P] [US1] Implement Base64 processing and schema validation in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/processors/base64.ts` and `/c/Users/kodia/IdeaProjects/DevTools/lib/validation/base64.ts`
- [X] T022 [P] [US1] Implement hash processing, legacy labeling, and schema validation in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/processors/hash.ts` and `/c/Users/kodia/IdeaProjects/DevTools/lib/validation/hash.ts`
- [X] T023 [P] [US1] Build the UUID route shell and interactive form in `/c/Users/kodia/IdeaProjects/DevTools/app/tools/uuid/page.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/tools/uuid/uuid-tool.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/tools/uuid/uuid-tool.module.css`
- [X] T024 [P] [US1] Build the Base64 route shell and interactive form in `/c/Users/kodia/IdeaProjects/DevTools/app/tools/base64/page.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/tools/base64/base64-tool.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/tools/base64/base64-tool.module.css`
- [X] T025 [P] [US1] Build the Hash route shell and interactive form in `/c/Users/kodia/IdeaProjects/DevTools/app/tools/hash/page.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/tools/hash/hash-tool.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/tools/hash/hash-tool.module.css`
- [X] T026 [US1] Implement shared result, validation, and copy feedback UI for the core tools in `/c/Users/kodia/IdeaProjects/DevTools/components/tools/shared/result-panel.tsx` and `/c/Users/kodia/IdeaProjects/DevTools/components/tools/shared/result-panel.module.css`

**Checkpoint**: User Story 1 is independently usable and can serve as the MVP release.

---

## Phase 4: User Story 2 - Build cron expressions confidently (Priority: P2)

**Goal**: Deliver a guided cron builder that outputs a valid six-field expression with seconds and a human-readable summary.

**Independent Test**: A user can open `/tools/cron`, choose a schedule, generate a six-field cron expression plus readable summary, and receive actionable feedback for incomplete or conflicting selections.

### Tests for User Story 2

- [X] T027 [P] [US2] Add unit coverage for cron validation and expression building in `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/tools/cron-processor.test.ts` and `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/tools/cron-schema.test.ts`
- [X] T028 [P] [US2] Add integration coverage for the guided cron builder flow in `/c/Users/kodia/IdeaProjects/DevTools/tests/integration/cron-tool.test.tsx`
- [X] T029 [P] [US2] Add end-to-end smoke and accessibility coverage for the cron tool, including cron-result copy behavior, in `/c/Users/kodia/IdeaProjects/DevTools/tests/e2e/cron-tool.spec.ts`

### Implementation for User Story 2

- [X] T030 [P] [US2] Implement cron draft validation and six-field expression building in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/processors/cron.ts` and `/c/Users/kodia/IdeaProjects/DevTools/lib/validation/cron.ts`
- [X] T031 [P] [US2] Build cron builder controls and the readable summary panel in `/c/Users/kodia/IdeaProjects/DevTools/components/tools/cron/cron-builder.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/tools/cron/cron-summary.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/tools/cron/cron-builder.module.css`
- [X] T032 [US2] Implement the cron route shell and wire validation, loading, error, and copy feedback in `/c/Users/kodia/IdeaProjects/DevTools/app/tools/cron/page.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/app/tools/cron/loading.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/components/tools/cron/cron-tool.tsx`, and `/c/Users/kodia/IdeaProjects/DevTools/components/tools/cron/cron-errors.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently and cover the full initial end-user tool set.

---

## Phase 5: User Story 3 - Grow the tool catalog without redesign (Priority: P3)

**Goal**: Prove that new tools plug into the existing catalog, route metadata, and tile pattern through the typed registry workflow established in the foundational phase.

**Independent Test**: A maintainer can add a new tool definition fixture and verify that it appears in the catalog with the same tile treatment and navigation behavior without changing the catalog component structure.

### Tests for User Story 3

- [X] T033 [P] [US3] Add unit coverage for registry invariants and metadata derivation in `/c/Users/kodia/IdeaProjects/DevTools/tests/unit/tools/registry.test.ts`
- [X] T034 [P] [US3] Add integration coverage for rendering a newly added tool definition fixture in `/c/Users/kodia/IdeaProjects/DevTools/tests/integration/tool-registry.test.tsx`
- [X] T035 [P] [US3] Add end-to-end coverage for registry-driven catalog navigation consistency in `/c/Users/kodia/IdeaProjects/DevTools/tests/e2e/catalog-registry.spec.ts`

### Implementation for User Story 3

- [X] T036 [US3] Harden catalog rendering and route metadata derivation for newly added registry entries in `/c/Users/kodia/IdeaProjects/DevTools/components/marketing/tool-catalog.tsx` and `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/metadata.ts`
- [X] T037 [P] [US3] Add a reusable tool-definition factory and maintainer documentation in `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/create-tool-definition.ts` and `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/README.md`
- [X] T038 [US3] Document the add-a-tool workflow and acceptance checklist in `/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/quickstart.md` and `/c/Users/kodia/IdeaProjects/DevTools/AGENTS.md`

**Checkpoint**: New tool additions use the same registry-driven pattern and no catalog redesign is required.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize cross-story quality, documentation, and release readiness.

- [X] T039 [P] Improve visible focus, contrast, and responsive polish across shared surfaces in `/c/Users/kodia/IdeaProjects/DevTools/styles/globals.css`, `/c/Users/kodia/IdeaProjects/DevTools/components/ui/icon-tile.module.css`, and `/c/Users/kodia/IdeaProjects/DevTools/components/tool-shell/tool-page-shell.module.css`
- [X] T040 [P] Optimize route metadata, icon loading, and client bundle boundaries in `/c/Users/kodia/IdeaProjects/DevTools/app/page.tsx`, `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/registry.ts`, and `/c/Users/kodia/IdeaProjects/DevTools/lib/tools/icon-map.tsx`
- [X] T041 Measure homepage and tool-route Core Web Vitals plus initial JavaScript payloads against the plan budgets and capture the results in `/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/quickstart.md`
- [X] T042 Record final automated accessibility results, manual keyboard-only verification notes, and build/regression verification steps in `/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/quickstart.md`
- [X] T043 Update runtime usage and local development guidance in `/c/Users/kodia/IdeaProjects/DevTools/README.md` and `/c/Users/kodia/IdeaProjects/DevTools/specs/001-devtools-tool-suite/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and starts immediately.
- **Phase 2: Foundational** depends on Setup and blocks all story work.
- **Phase 3: US1** depends on Foundational and defines the MVP slice.
- **Phase 4: US2** depends on Foundational and the shared catalog/registry from US1.
- **Phase 5: US3** depends on Foundational and the live catalog pattern established in US1.
- **Phase 6: Polish** depends on all stories that are in scope for the release.

### User Story Dependencies

- **US1 (P1)**: No story dependency after Foundational; deliver first.
- **US2 (P2)**: Build after US1 establishes the shared catalog and tool shell.
- **US3 (P3)**: Build after US1; verify against the completed catalog and route pattern.

### Within Each User Story

- Write tests before marking implementation complete.
- Finish processing and validation helpers before final UI wiring.
- Complete accessibility, copy-feedback, and responsive behavior before story sign-off.
- Do not mark a story complete until its independent test passes.

### Dependency Graph

`Setup -> Foundational -> US1 -> {US2, US3} -> Polish`

---

## Parallel Opportunities

- **Setup**: `T003`, `T004`, and `T005` can run in parallel after `T001` and `T002`.
- **Foundational**: `T008`, `T009`, `T010`, `T011`, and `T012` can run in parallel after `T007`.
- **US1**: `T015`, `T016`, and `T017` can run together; `T020`, `T021`, `T022`, `T023`, `T024`, and `T025` can be split by file ownership after `T019`.
- **US2**: `T027`, `T028`, and `T029` can run together; `T030` and `T031` can run in parallel before `T032`.
- **US3**: `T033`, `T034`, and `T035` can run together; `T037` can run in parallel with `T036` before `T038`.
- **Polish**: `T039` and `T040` can run in parallel before the measurement and documentation closeout tasks.

## Parallel Example: User Story 1

```bash
Task: "Add unit coverage in tests/unit/tools/uuid-processor.test.ts, tests/unit/tools/base64-processor.test.ts, and tests/unit/tools/hash-processor.test.ts"
Task: "Add integration coverage in tests/integration/devtools-catalog.test.tsx and tests/integration/core-tools.test.tsx"
Task: "Add e2e smoke coverage in tests/e2e/core-tools.spec.ts"
```

```bash
Task: "Implement UUID processing in lib/tools/processors/uuid.ts and lib/validation/uuid.ts"
Task: "Implement Base64 processing in lib/tools/processors/base64.ts and lib/validation/base64.ts"
Task: "Implement Hash processing in lib/tools/processors/hash.ts and lib/validation/hash.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add cron tests in tests/unit/tools/cron-processor.test.ts, tests/unit/tools/cron-schema.test.ts, tests/integration/cron-tool.test.tsx, and tests/e2e/cron-tool.spec.ts"
Task: "Build cron controls in components/tools/cron/cron-builder.tsx and components/tools/cron/cron-summary.tsx"
Task: "Implement cron validation in lib/tools/processors/cron.ts and lib/validation/cron.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add registry tests in tests/unit/tools/registry.test.ts and tests/integration/tool-registry.test.tsx"
Task: "Harden registry-driven metadata handling in components/marketing/tool-catalog.tsx and lib/tools/metadata.ts"
Task: "Document the add-a-tool workflow in lib/tools/README.md and specs/001-devtools-tool-suite/quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate the independent test for User Story 1.
5. Release or demo the MVP before starting cron and extensibility follow-up.

### Incremental Delivery

1. Ship Setup and Foundational once.
2. Ship US1 as the first production-ready slice.
3. Add US2 for the full initial tool set.
4. Add US3 to lock in the future-tool workflow.
5. Finish with Polish and final regression evidence.

### Parallel Team Strategy

1. One engineer completes Setup and Foundational.
2. After US1 opens the catalog pattern, one engineer can take US2 while another takes US3.
3. Merge only after CI quality gates and each story's independent test pass.

---

## Notes

- All tasks use explicit file paths and follow the required checklist format.
- No backend API implementation tasks are included because MVP tool processing stays in the browser.
- `US1` is the suggested MVP scope.
