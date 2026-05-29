# KeyHub Config Spec

This directory defines the baseline settings structure used by KeyHub.

## Files
- `settings.template.json`: Editable starter example.
- `settings.schema.json`: JSON Schema used for validation.

## Runtime Location
The app uses:
`~/.config/keyhub/settings.json`

## Notes
- v1 default strategy is plaintext API key storage.
- Future migration can switch to keychain-backed mode while preserving schema compatibility.
