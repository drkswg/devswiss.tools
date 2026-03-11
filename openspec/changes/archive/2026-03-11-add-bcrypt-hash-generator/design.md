## Context

The current app already supports browser-local transformation tools with a consistent pattern: a registry entry, a thin route module, a client-side tool component, a processor in `lib/tools/processors/`, and validation in `lib/validation/`. The existing hash tool covers digest algorithms, but bcrypt has different semantics because it is intentionally slow, always salted, and requires a configurable work factor rather than a simple algorithm selector.

Adding bcrypt also introduces a dependency decision because the browser platform does not expose bcrypt through Web Crypto. The implementation therefore needs a browser-compatible bcrypt library while preserving the project rule that tool execution stays local to the browser.

## Goals / Non-Goals

**Goals:**
- Add a dedicated Bcrypt Hash Generator tool that fits the existing registry, route, and tool-shell patterns.
- Let users generate bcrypt hashes locally from plain text with a rounds value between `1` and `20`.
- Validate input and rounds with actionable field-level feedback before generation.
- Explain bcrypt-specific behavior, especially that fresh salts can produce different hashes for the same input.
- Cover the new workflow with unit, integration, and e2e tests consistent with the current tool suite.

**Non-Goals:**
- Adding bcrypt password verification or compare workflows in this change.
- Sending hashing requests to a server or introducing backend storage.
- Folding bcrypt into the existing digest-based hash tool UI.
- Adding advanced bcrypt variants or prefix selection beyond what the chosen browser library emits.

## Decisions

Create a standalone `bcrypt` tool and route instead of adding bcrypt as another option inside the existing hash tool.
Rationale: digest generation and password hashing have different UX expectations, terminology, and performance characteristics. A separate tool avoids overloading the current hash page with bcrypt-only controls such as rounds guidance.
Alternative considered: extend the current hash tool with a `bcrypt` algorithm option. Rejected because the existing page is built around fast digest generation and legacy algorithm messaging, which would become confusing once salted password hashes are mixed into the same control set.

Use a browser-compatible bcrypt dependency in a dedicated processor so hashing remains fully client-side.
Rationale: Web Crypto does not implement bcrypt, so a runtime library is required. Encapsulating it in `lib/tools/processors/` keeps the React component thin and preserves the current separation between UI, validation, and transformation logic.
Alternative considered: implement bcrypt manually in the codebase. Rejected because it would add unnecessary cryptographic maintenance risk compared with a dedicated library.

Model rounds as a validated numeric field constrained to `1` through `20`, and keep the submission flow asynchronous with visible loading state.
Rationale: the requested work factor range is explicit, and higher rounds can take noticeably longer in the browser. Validation should reject out-of-range values early, while the async submit state prevents duplicate submissions and makes slower runs understandable.
Alternative considered: hard-code a small set of rounds in a dropdown. Rejected because the user explicitly asked for an adjustable parameter across the full `1` to `20` range.

Show bcrypt-specific result guidance alongside the generated hash and support copying the latest valid output.
Rationale: users often expect deterministic hashes based on digest-tool behavior. Calling out that bcrypt hashes are salted prevents false bug reports when repeated submissions differ, and copy support matches the rest of the tool suite.
Alternative considered: rely on generic helper text only. Rejected because salted-output behavior is central to interpreting the result correctly.

## Risks / Trade-offs

[Higher rounds can feel slow or frozen on low-powered devices] -> Keep generation asynchronous, show an in-progress state, and avoid any requirement for instant output at high work factors.

[A new runtime dependency increases bundle and maintenance surface] -> Scope the dependency to the bcrypt tool path and cover the processor with unit tests so upgrades stay localized.

[Users may assume repeated hashing of the same text should return the same output] -> Explain salt-driven output changes in the tool copy and result messaging.

[Adding a new tool affects registry ordering and sequential next-tool navigation] -> Update the registry order and route navigation links together, then verify direct-route coverage in integration and e2e tests.
