# KeyHub

KeyHub is a desktop app built with Vue 3 + Tauri 2 for managing API information across AI providers (keys, URLs, models, status), with optional balance/usage fetching.

## Features

- Hierarchical management: root groups, subgroups, and items.
- Item fields: provider, website, API keys, API URLs, models, active switch, and more.
- Multi-line fields: keys/URLs/models can be entered as multi-line values and stored as lists.
- Auto icon matching: common provider icons are inferred from provider names (custom icon URL also supported).
- Detail actions: copy values, reveal/hide keys, and quick previous/next navigation.
- Advanced config: configure balance and usage endpoints with JSON paths.
- Runtime fetching: fetch balance/usage directly from the detail panel.
- History storage: fetched data is saved into a separate local data file.
- Config editor: direct JSON edit, tree view, import, and download.
- UI capabilities: collapsible/resizable sidebar, drag-to-reorder mode, theme switching (system/light/dark), and i18n (Chinese/English).
- Desktop behavior: always-on-top toggle (when supported by platform/runtime).

## Tech Stack

- Frontend: Vue 3, Vite, Naive UI, Vue I18n, vuedraggable
- Desktop: Tauri 2 (Rust)
- Package manager: pnpm

## Prerequisites

Recommended versions:

- Node.js 18+
- pnpm 8+
- Rust stable (with Cargo)
- Tauri 2 system dependencies for your OS

If this is your first Tauri setup, see:
https://tauri.app/start/prerequisites/

## Install and Run

1. Install dependencies

```bash
pnpm install
```

2. Frontend-only development

```bash
pnpm dev
```

Default Vite port is 1420 (see vite.config.js).

3. Desktop development (Tauri)

```bash
pnpm dev:tauri
```

## Build

1. Build frontend

```bash
pnpm build
```

2. Build desktop bundles

```bash
pnpm build:tauri
```

## Scripts

- pnpm dev: start Vite dev server
- pnpm build: build frontend assets
- pnpm preview: preview built frontend
- pnpm dev:tauri: run Tauri development mode
- pnpm build:tauri: build Tauri application bundles
- pnpm icon: generate/update app icon assets

## Data Files

By default, the app reads/writes:

- ~/.config/keyhub/settings.json: main config (groups/items)
- ~/.config/keyhub/data.json: fetched balance/usage history

Writes are performed atomically (temp file + rename) to reduce corruption risk.

## Config Schema Example

settings.json accepts either an array root or an object root ({ "groups": [...] }).

```json
{
  "groups": [
    {
      "type": "subGroup",
      "id": "group-openai",
      "name": "OpenAI",
      "children": [
        {
          "type": "item",
          "id": "item-gpt",
          "name": "Production Key",
          "description": "Main production key",
          "provider": "openai",
          "website": "https://platform.openai.com",
          "api_keys": ["sk-xxx"],
          "api_urls": ["https://api.openai.com/v1"],
          "models": ["gpt-4o", "gpt-4.1"],
          "switch": true,
          "balance_url": "https://example.com/balance",
          "balance_amount_path": "data.total_balance",
          "balance_unit_path": "data.unit",
          "usage_url": "https://example.com/usage",
          "usage_path": "data.usage_5h",
          "usage_week_path": "data.usage_week"
        }
      ]
    }
  ]
}
```

## Security Notes

- settings.json can contain sensitive API keys. Do not commit it to public repositories.
- If you need to sync configuration, encrypt it before storing/transferring.
- Balance/usage fetch uses the first API key as a Bearer token.

## Roadmap (Draft)

- Home dashboard
- Usage analytics view
