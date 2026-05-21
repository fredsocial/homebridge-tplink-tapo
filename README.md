# homebridge-tplink-tapo

Homebridge plugin for legacy TP-Link/Kasa smart home devices and newer TP-Link Tapo devices.

This repository combines the maintained legacy Kasa discovery/accessory model from `homebridge-tplink-smarthome` with the local Tapo protocol support from `homebridge-tapo-p100`.

## Supported Devices

Legacy TP-Link/Kasa support is provided through automatic local discovery:

- Plugs: EP25, EP40, HS100, HS103, HS105, HS107, HS110, HS300, KP105, KP115, KP303, KP400
- Switches: ES20M, HS200, HS210, HS220, HS230
- Bulbs: KL50, KL120, KL125, LB100, LB110, LB120, LB130, LB200, LB230
- Lightstrips: KL400, KL430

Tapo support is configured manually by IP address:

- Plugs: P100/P105, P110
- Lights: L510/L510E, L520/L520E, L530/L530E

## Installation

```sh
npm install -g @fredsocial/homebridge-tplink-tapo
```

Node 18 or newer and Homebridge 1.6 or newer are required.

## Configuration

Legacy TP-Link/Kasa devices can usually be discovered with only the platform entry:

```json
{
  "platform": "TplinkTapo",
  "name": "TP-Link Tapo"
}
```

Tapo devices require Tapo app credentials and manual device entries:

```json
{
  "platform": "TplinkTapo",
  "name": "TP-Link Tapo",
  "username": "you@example.com",
  "password": "your-tapo-password",
  "tapoDevices": [
    { "name": "Desk Plug", "host": "192.168.1.40", "type": "P100" },
    { "name": "Washer", "host": "192.168.1.41", "type": "P110" },
    { "name": "Lamp", "host": "192.168.1.42", "type": "L530" }
  ]
}
```

You can also keep legacy manual discovery entries in `devices`. Entries with only `host`/`port` are treated as legacy TP-Link/Kasa devices; entries with `name` or `type` are treated as Tapo devices.

```json
{
  "platform": "TplinkTapo",
  "name": "TP-Link Tapo",
  "username": "you@example.com",
  "password": "your-tapo-password",
  "devices": [
    { "host": "192.168.1.20" },
    { "host": "192.168.1.21", "port": 9999 },
    { "name": "Tapo Plug", "host": "192.168.1.40", "type": "P100" }
  ]
}
```

## Options

- `broadcast`: broadcast address for legacy discovery, default `255.255.255.255`
- `pollingInterval`: legacy discovery/device polling interval in seconds, default `10`
- `deviceTypes`: legacy discovery types, default `["bulb", "plug"]`
- `macAddresses` / `excludeMacAddresses`: legacy allow/deny filters
- `devices`: mixed manual list; untyped entries are legacy devices, typed entries are Tapo devices
- `tapoDevices`: Tapo-only manual list
- `username` / `password`: Tapo app credentials
- `timeout`: legacy communication timeout in seconds, default `15`
- `transport`: legacy device transport, `tcp` or `udp`
- `emeterPollingInterval`: legacy energy polling interval in seconds, default `20`
- `addCustomCharacteristics`: exposes legacy energy characteristics for Eve, default `true`

## Development

```sh
npm install
npm run build
npm run lint
npx jest --runInBand --forceExit
```

`--forceExit` is currently useful for the Homebridge integration test harness because Homebridge and device discovery can leave background handles open after assertions finish.

## ARCHITECTURE

The plugin is a single Homebridge platform (`TplinkTapo`) that orchestrates two device stacks:

- Legacy TP-Link/Kasa stack (derived from `homebridge-tplink-smarthome`)
- Tapo local-auth stack (derived from `homebridge-tapo-p100`)

Code layout:

- `src/index.ts`: Homebridge entrypoint and platform registration
- `src/platform.ts`: primary platform lifecycle, discovery, polling, and accessory wiring
- `src/config.ts`: schema-backed config parsing/validation and migration helpers
- `src/homekit-device/*`: legacy TP-Link/Kasa accessory wrappers
- `src/tapo/platform*Accessory.ts`: Tapo accessory wrappers (P100/P110/L510/L520/L530 families)
- `src/tapo/utils/*`: Tapo protocol/cipher/session helpers, usage and energy helpers
- `src/characteristics/*` and `src/tapo/custom-characteristics/*`: HomeKit custom characteristics for energy/telemetry
- `config.schema.json`: Homebridge UI schema
- `test/*`: unit/integration tests (config parsing, platform boot, accessory lifecycle)

Runtime flow:

1. Homebridge loads platform and calls `parseConfig`.
2. Config is normalized into legacy and Tapo device lists.
3. Legacy devices are discovered (broadcast/manual) and bridged.
4. Tapo devices are initialized from manual entries and authenticated locally.
5. Accessory state is polled and pushed to HomeKit characteristics.

## DECISIONS

- Keep one plugin for both ecosystems so users can migrate without running two Homebridge plugins.
- Preserve legacy discovery and config behavior first, then layer Tapo support without breaking existing setups.
- Require manual Tapo IP entries for predictable local operation (no cloud dependency at runtime).
- Accept host aliases (`host`, `ip`, `address`) when normalizing Tapo/manual entries for easier migration.
- Keep TypeScript source as the single source of truth; publish only built `lib/` output and schema/docs.
- Use scoped package publishing (`@fredsocial/homebridge-tplink-tapo`) with public access.

## TODO

- Improve Tapo handshake fallback logic after KLAP failures (retry strategy and clearer downgrade path).
- Expand test fixtures for mixed legacy+Tapo configs and invalid/partial Tapo credentials.
- Add device support matrix by model/firmware and known limitations per model.
- Add structured debug logging toggles for auth/discovery without noisy default logs.
- Add migration guide from separate legacy/Tapo plugins to this combined plugin.
- Automate release versioning/changelog generation.

## RUNBOOK

Local setup:

```sh
git clone git@github.com:fredsocial/homebridge-tplink-tapo.git
cd homebridge-tplink-tapo
npm install
npm run build
npm run lint
npx jest --runInBand --forceExit
```

Local Homebridge test:

1. Install plugin locally in your Homebridge environment.
2. Set platform to `TplinkTapo`.
3. For Tapo devices, provide `username`, `password`, and `tapoDevices` with `host` (or `ip`/`address`), `name`, `type`.
4. Restart Homebridge and confirm accessories are loaded.

Release checklist:

1. Ensure tests/lint/build pass.
2. Bump version (required; npm rejects re-publishing same version):
   - `npm version patch` (or `minor`/`major`)
3. Commit and push release commit/tag.
4. Publish as public scoped package:
   - `npm publish --access public`
5. Complete npm auth/2FA prompt in browser/terminal if requested.

Common publish issues:

- `402 Payment Required ... sign up for private packages`:
  - Publish with `--access public` and/or set `"publishConfig": { "access": "public" }`.
- `You cannot publish over the previously published versions`:
  - Bump version before publishing.
- `EOTP`:
  - Provide current npm authenticator code.

Homebridge troubleshooting:

- `ConfigParseError ... tapoDevices/0 must have required property 'host'`:
  - Use `host` field (or `ip`/`address` if supported by your installed version) and verify each Tapo entry has required fields.
- `KLAP Handshake failed`:
  - Verify model/type mapping, device IP, credentials, and same-LAN reachability.
  - Confirm device firmware and retry after Homebridge restart.
  - If persistent, enable debug logs and capture full startup logs for protocol fallback analysis.

## Credits

This project incorporates work from:

- `plasticrake/homebridge-tplink-smarthome` for legacy TP-Link/Kasa support.
- `apatsufas/homebridge-tapo-p100` for local Tapo protocol support.

See `LICENSE` for the inherited license terms.
