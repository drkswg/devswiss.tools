## Why

The current tool catalog covers identifiers, encodings, hashes, cron expressions, and XML, but it does not help with one of the most common debugging and API tasks: understanding Unix timestamps and converting them to readable date and time values. Adding a dedicated browser-local Timestamp Converter fills that gap and keeps users from leaving the site for routine timestamp inspection and conversion work.

## What Changes

- Add a new `Timestamp Converter` tool route to the registry-driven catalog and shared tool navigation.
- Let users enter a Unix timestamp and receive a readable explanation plus converted date and time output without a server round-trip.
- Let users enter a date and time value and convert it back into a Unix timestamp in the browser.
- Support copying the latest generated timestamp through the shared result workflow.
- Add unit, integration, and e2e coverage for the new processor, validation, route wiring, and primary conversion journeys.

## Capabilities

### New Capabilities
- `timestamp-converter`: Convert between Unix timestamps and readable date/time values, explain normalized timestamp details, and support copying the latest generated timestamp.

### Modified Capabilities
- None.

## Impact

- Affected UI: homepage catalog, `app/tools/<slug>/page.tsx`, shared tool navigation, and a new client tool component under `components/tools/`
- Affected logic: new validation schema and browser-side timestamp processor under `lib/validation/` and `lib/tools/processors/`
- Affected verification: unit, integration, and Playwright coverage for the new tool and registry wiring
- Dependencies: reuse built-in browser date/time APIs; no external service is required
