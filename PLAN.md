# KeyHub Implementation Plan

## Confirmed Constraints
- macOS native app only.
- Single editable config file at `~/.config/keyhub/settings.json`.
- v1 stores keys in plaintext by default.
- v1 usage metrics are manual refresh first.
- Provider scope: OpenAI, Anthropic, Gemini/Vertex, Azure OpenAI, OpenRouter, OpenAI-compatible gateways.

## Milestones
1. M1: Baseline architecture + schema freeze.
2. M2: Config read/write core + file watch + conflict handling.
3. M3: Domain CRUD + connectivity test service.
4. M4: Usage adapters + manual refresh + primary UI flow.
5. M5: Validation, performance, and release readiness.

## Current Progress (Step 1)
- Replaced default SwiftUI page with a three-column KeyHub scaffold.
- Added startup bootstrap to initialize `~/.config/keyhub/settings.json`.
- Added config spec files:
  - `.config-spec/settings.template.json`
  - `.config-spec/settings.schema.json`

## Next Step
- Build `ConfigManager` with load/save/atomic write/reload and schema validation wiring.
