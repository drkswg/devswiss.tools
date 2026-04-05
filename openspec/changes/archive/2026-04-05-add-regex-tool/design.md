## Context

The app adds tools through a consistent stack: a registry entry, a thin App Router page, a client-side tool component, validation in `lib/validation/`, browser-local processors in `lib/tools/processors/`, and layered unit, integration, and e2e coverage. A regex tool fits that pattern, but it introduces one constraint the current tools do not have: the requested behavior is flavor-specific while the app must remain browser-local and cannot call a Java or Oracle runtime.

The initial launch scope also spans two different regex ecosystems. Java patterns are close to mainstream backtracking engines and commonly use inline constructs, while PL/SQL regex behavior is rooted in Oracle-style expressions with POSIX-oriented character classes and different supported features. That means the design needs a clear rule for what the tool explains, what it can execute exactly in the browser, and how it communicates unsupported constructs without misleading the user.

## Goals / Non-Goals

**Goals:**
- Add a dedicated `/tools/regex` route and registry entry for a `Regex Tester` tool.
- Let users choose `Java` or `PL/SQL`, enter a pattern, enter sample text, and analyze both inputs in one browser-local workflow.
- Generate a deterministic explanation of the pattern structure that reflects the selected flavor and highlights flavor-specific constructs.
- Report match information for the sample text, including whether any match exists, whether the full sample matches, and details for matched spans and capture groups.
- Reject invalid or unsupported flavor-specific patterns with actionable feedback instead of running a misleading browser regex.
- Keep the feature browser-local and cover it with unit, integration, and e2e tests.

**Non-Goals:**
- Providing exact runtime parity with every Java `Pattern` feature or every Oracle/PL-SQL regex feature in the first release.
- Adding AI-generated prose, remote regex execution, or server-side analysis.
- Supporting more regex flavors than `Java` and `PL/SQL` in this change.
- Persisting analysis history, saving regex snippets, or sharing test cases.

## Decisions

Add the regex tool as a standalone route with one flavor-aware analysis workflow.
Rationale: the user inputs are tightly coupled. Flavor, pattern, and sample text should be evaluated together so explanation output, compatibility feedback, and match details stay in sync. A single workflow also matches the current tool-page pattern without requiring cross-cutting changes to shared routing or metadata.
Alternative considered: split explanation and matching into separate workflows. Rejected because it duplicates input state and makes flavor-specific errors harder to present coherently.

Implement a flavor-aware analysis pipeline in `lib/tools/processors/regex.ts` backed by validation in `lib/validation/regex.ts`.
Rationale: the repo already separates UI concerns from input validation and transformation logic. The regex tool can follow that pattern with a single processor module that performs normalization, tokenization, explanation generation, compatibility checks, and sample-text execution. This keeps the client component focused on form state and rendering.
Alternative considered: put parsing and matching logic directly in the React component. Rejected because it would make the behavior harder to test and inconsistent with the rest of the codebase.

Use a lightweight internal tokenizer and flavor-rule tables instead of depending on a third-party parser for the first release.
Rationale: the app needs Java-aware and PL/SQL-aware explanations, but common browser-oriented regex libraries primarily model JavaScript syntax. A small internal tokenizer that recognizes literals, escapes, groups, character classes, quantifiers, anchors, alternation, and common inline constructs gives the project direct control over explanation text, unsupported-feature messages, and future flavor expansion without adding bundle weight or adopting a parser that does not map cleanly to Oracle syntax.
Alternative considered: add a general-purpose regex parsing dependency. Rejected because the likely candidates are JavaScript-centric, would still require flavor-specific compatibility logic, and would not eliminate the browser-parity problem.

Scope execution support to a documented subset that can be translated safely to the browser `RegExp` engine, and block execution for incompatible constructs.
Rationale: explanation and validation can be deterministic for more constructs than execution can support exactly. The processor should translate supported Java and PL/SQL tokens into a JavaScript-compatible source, compile them with normalized flags, and run them against the sample text only when the translation is safe. When the selected flavor includes unsupported constructs, the tool should explain the limitation and avoid returning match output that implies exact parity.
Alternative considered: always attempt direct execution with JavaScript `RegExp`. Rejected because it would silently misrepresent Java and PL/SQL semantics for some constructs and violate the user's request for flavor-aware behavior.

Return both "any match" and "full sample match" status plus bounded match details.
Rationale: users often need to know whether a pattern appears anywhere in the sample text and whether it matches the entire string. The processor should therefore report both states, then return a bounded list of matched spans with start and end offsets and captured-group values so the UI can surface practical debugging details without overwhelming the page on very large samples.
Alternative considered: expose only the first match result. Rejected because it hides whether the full sample matched and makes it harder to debug repeated occurrences.

Keep the first release submit-driven rather than continuously re-running analysis on every keystroke.
Rationale: the rest of the tool suite uses explicit form submission, which keeps validation messaging, loading states, and test behavior straightforward. The tool can still "auto generate" explanation and match output from the submitted inputs without adding live-analysis complexity or repeated processing on every change.
Alternative considered: live analysis on input change. Rejected because it increases UI churn, complicates field-error timing, and is not necessary for the initial release.

## Risks / Trade-offs

[Some valid Java or PL/SQL constructs will be outside the supported execution subset] -> Surface explicit unsupported-feature feedback tied to the selected flavor and suppress match output until the user changes the pattern or flavor.

[Flavor-aware explanation logic can drift from actual runtime semantics over time] -> Keep flavor rules centralized in declarative token metadata and cover representative Java and PL/SQL examples with unit tests.

[Large sample text can create noisy or expensive match output] -> Cap free-text inputs with the shared validation limit and bound the number of returned match rows while still reporting overall match state.

[Users may expect PL/SQL support to include Oracle function parameters such as separate match modifiers] -> Limit the first release to pattern-text analysis and matching, mention scope in guidance copy, and leave modifier-specific UI for a follow-up change if needed.

## Migration Plan

This change is additive. Ship the new route, registry entry, validation, processor, UI, and tests together. No data migration is required, and rollback is limited to reverting the feature if needed.

## Open Questions

- None at proposal time.
