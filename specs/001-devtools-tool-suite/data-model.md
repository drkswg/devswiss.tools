# Data Model: DevTools Tool Suite

## Entity: ToolDefinition

**Purpose**: Canonical catalog entry used to render the homepage tile, route metadata, and navigation.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `id` | string | Yes | Stable internal identifier, e.g. `uuid`, `base64`, `hash`, `cron` |
| `slug` | string | Yes | Route-safe value used at `/tools/<slug>` |
| `name` | string | Yes | User-facing tool name |
| `description` | string | Yes | Short tile and metadata summary |
| `iconKey` | string | Yes | Key for the chosen icon component |
| `accentToken` | enum | Yes | One of `orange`, `green`, `blue`, `yellow` |
| `routePath` | string | Yes | Absolute route path |
| `order` | number | Yes | Tile ordering on the homepage |
| `category` | string | Yes | Initial value: `Developer Utilities` |
| `supportsCopy` | boolean | Yes | Whether the tool exposes a copy action |
| `status` | enum | Yes | `active` for MVP, reserved for future `coming-soon` |

**Validation rules**:
- `id`, `slug`, and `routePath` must be unique.
- `routePath` must match `/tools/<slug>` except the homepage catalog entry.
- `accentToken` must map to an approved design token.

**Relationships**:
- One `ToolDefinition` has one or more `ToolActionDefinition` entries.
- One `ToolDefinition` maps to one homepage `ToolTile` rendering.

## Entity: ToolActionDefinition

**Purpose**: Describes the actions a tool supports so UI controls and empty/error states can stay consistent.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `toolId` | string | Yes | Foreign key to `ToolDefinition.id` |
| `actionId` | string | Yes | Stable action identifier |
| `label` | string | Yes | User-facing control label |
| `mode` | string | Yes | Example: `generate`, `validate`, `encode`, `decode` |
| `inputFields` | string[] | Yes | Ordered list of input field identifiers |
| `resultKind` | enum | Yes | `text`, `status`, or `expression` |
| `helperText` | string | No | Optional contextual explanation |

**Validation rules**:
- `actionId` must be unique within a tool.
- Each input field identifier must exist in the associated tool state schema.

## Entity: ToolSession

**Purpose**: Shared UI state contract for a single user interaction.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `toolId` | string | Yes | Current tool |
| `selectedAction` | string | Yes | Current action or mode |
| `selectedVariant` | string | No | Used for UUID versions or hash algorithms |
| `inputSnapshot` | record<string, string> | Yes | Raw user-provided values |
| `resultValue` | string | No | Latest computed output |
| `validationState` | enum | Yes | `idle`, `valid`, `invalid`, `error` |
| `message` | string | No | Human-readable validation or status feedback |
| `copied` | boolean | Yes | Whether the latest result was copied |

**State transitions**:
- `idle -> valid`: inputs are complete and produce a result.
- `idle -> invalid`: incomplete or malformed input.
- `valid -> copied`: result copied successfully.
- `valid/invalid -> error`: browser API failure or unexpected runtime issue.

## Entity: UUIDToolState

**Purpose**: Version-aware state for UUID generation and validation.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `mode` | enum | Yes | `generate` or `validate` |
| `version` | enum | Yes | `v1`, `v3`, `v4`, `v5`, `v7` |
| `namespace` | string | Conditional | Required for `v3` and `v5` generation |
| `name` | string | Conditional | Required for `v3` and `v5` generation |
| `inputValue` | string | Conditional | Required for validation |
| `resultValue` | string | No | Generated UUID or validated echo |
| `validationState` | enum | Yes | `idle`, `valid`, `invalid`, `error` |
| `message` | string | No | Explains invalid input or success state |

**Validation rules**:
- Generation must accept only supported versions.
- `namespace` and `name` are mandatory when `version` is `v3` or `v5`.
- Validation accepts only versions 1, 3, 4, 5, and 7.

## Entity: Base64ToolState

**Purpose**: State contract for Base64 encoding and decoding.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `mode` | enum | Yes | `encode` or `decode` |
| `inputValue` | string | Yes | Raw user text |
| `resultValue` | string | No | Converted output |
| `validationState` | enum | Yes | `idle`, `valid`, `invalid`, `error` |
| `message` | string | No | Invalid decode or empty-input feedback |

**Validation rules**:
- Empty input returns a clear empty state instead of crashing.
- Decode mode must reject malformed Base64 input with actionable feedback.
- Unicode text must round-trip correctly.

## Entity: HashToolState

**Purpose**: State contract for hash generation.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `algorithm` | enum | Yes | `md5`, `sha1`, `sha256`, `sha512` |
| `inputValue` | string | Yes | Raw source text |
| `resultValue` | string | No | Lowercase hexadecimal hash output |
| `legacy` | boolean | Yes | `true` for MD5 and SHA-1 |
| `validationState` | enum | Yes | `idle`, `valid`, `invalid`, `error` |
| `message` | string | No | Empty-input or legacy warning message |

**Validation rules**:
- Only supported algorithms are accepted.
- MD5 and SHA-1 must always surface a legacy label/warning.
- Result formatting is lowercase hexadecimal for consistency.

## Entity: CronScheduleDraft

**Purpose**: Structured builder state for the six-field cron generator.

| Field | Type | Required | Notes |
|------|------|----------|-------|
| `seconds` | string | Yes | Cron field value |
| `minutes` | string | Yes | Cron field value |
| `hours` | string | Yes | Cron field value |
| `dayOfMonth` | string | Yes | Cron field value |
| `month` | string | Yes | Cron field value |
| `dayOfWeek` | string | Yes | Cron field value |
| `expression` | string | No | Combined six-field cron output |
| `humanSummary` | string | No | Readable explanation |
| `validationState` | enum | Yes | `idle`, `valid`, `invalid`, `error` |
| `errors` | string[] | Yes | Field-level or cross-field issues |

**Validation rules**:
- All six fields must be present before expression generation succeeds.
- Conflicting `dayOfMonth` and `dayOfWeek` choices must produce clear guidance.
- Generated expressions must stay compatible with the chosen six-field-with-seconds format.

## Relationships Summary

- `ToolDefinition (1) -> (many) ToolActionDefinition`
- `ToolDefinition (1) -> (1) ToolSession schema family`
- `ToolDefinition (uuid) -> UUIDToolState`
- `ToolDefinition (base64) -> Base64ToolState`
- `ToolDefinition (hash) -> HashToolState`
- `ToolDefinition (cron) -> CronScheduleDraft`
