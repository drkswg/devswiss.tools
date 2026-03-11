## Why

The current tool suite can generate fast cryptographic digests, but it does not cover password-hashing workflows that rely on bcrypt and a configurable work factor. Adding a browser-local Bcrypt Hash Generator closes that gap for developers who need to create bcrypt outputs without leaving the site.

## What Changes

- Add a new `Bcrypt Hash Generator` tool route to the registry-driven catalog and tool navigation.
- Let users enter plain text, choose a bcrypt rounds value from `1` through `20`, and generate a bcrypt hash entirely in the browser.
- Validate rounds and input length through shared validation primitives and present actionable field errors when the request is invalid.
- Surface bcrypt-specific UX guidance, including that hashes are salted and repeated submissions can produce different outputs for the same input.
- Add unit, integration, and e2e coverage for the new processor, validation, route wiring, and primary user journey.

## Capabilities

### New Capabilities
- `bcrypt-hash-generator`: Provide a dedicated browser-side tool for generating bcrypt hashes with a user-adjustable rounds value between `1` and `20`.

### Modified Capabilities
- None.

## Impact

- Affected UI: homepage catalog, `app/tools/<slug>/page.tsx`, shared tool navigation, and a new client tool component under `components/tools/`
- Affected logic: new validation schema and browser-side bcrypt processor under `lib/validation/` and `lib/tools/processors/`
- Affected verification: unit, integration, and Playwright coverage for the new tool and registry wiring
- Dependencies: likely one new browser-safe bcrypt runtime dependency because Web Crypto does not provide bcrypt
