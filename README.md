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
npm install -g homebridge-tplink-tapo
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

## Credits

This project incorporates work from:

- `plasticrake/homebridge-tplink-smarthome` for legacy TP-Link/Kasa support.
- `apatsufas/homebridge-tapo-p100` for local Tapo protocol support.

See `LICENSE` for the inherited license terms.
# homebridge-tplink-tapo
