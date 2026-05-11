import { ConfigParseError, defaultConfig, parseConfig } from '../src/config';

describe('config', function () {
  describe('parseConfig', function () {
    const minimalConfig = {
      platform: 'TplinkTapoApi',
      name: 'TplinkTapo',
    };

    const configInvalid = {
      platform: 'TplinkTapoApi',
      name: 'TplinkTapo',
      addCustomCharacteristics: 'true',
      inUseThreshold: 'foo',
      switchModels: 'foo',
      discoveryPort: 'foo',
      broadcast: 255,
      pollingInterval: 'foo',
      deviceTypes: [],
      macAddresses: [],
      excludeMacAddresses: [],
      devices: [],
      timeout: 'foo',
      transport: 'foo',
      waitTimeUpdate: 'foo',
    };

    it('should provide defaults with no config options', function () {
      const parsedConfig = parseConfig(minimalConfig);
      expect(parsedConfig).not.toBeNull();

      const parsedDefaultConfig = parseConfig({
        ...defaultConfig,
        name: 'defaultName',
      });
      expect(parsedConfig).toEqual(parsedDefaultConfig);
    });

    it('should throw ConfigParseError with incorrect types', function () {
      expect(() => {
        parseConfig(configInvalid);
      })
        .toThrow(ConfigParseError)
        .toThrow('must be');
    });

    it('should throw ConfigParseError with incorrect devices', function () {
      expect(() => {
        parseConfig({
          devices: [{ host: 123 }],
        });
      })
        .toThrow(ConfigParseError)
        .toThrow('`devices/0/host` must be string');

      expect(() => {
        parseConfig({
          devices: [{ port: 123 }],
        });
      })
        .toThrow(ConfigParseError)
        .toThrow("`devices/0` must have required property 'host'");

      expect(() => {
        parseConfig({
          devices: [{ badHost: 'host' }],
        });
      })
        .toThrow(ConfigParseError)
        .toThrow("`devices/0` must have required property 'host'");

      expect(() => {
        parseConfig({
          devices: [{ badHost: 'host' }],
        });
      })
        .toThrow(ConfigParseError)
        .toThrow("`devices/0` must have required property 'host'");
    });

    it('should normalize ip and address aliases to host', function () {
      expect(
        parseConfig({
          devices: [{ ip: '192.168.1.10' }],
          tapoDevices: [{ address: '192.168.1.20', name: 'Tapo Plug' }],
        })
      ).toMatchObject({
        discoveryOptions: {
          devices: [{ host: '192.168.1.10' }],
        },
        tapo: {
          devices: [{ host: '192.168.1.20', name: 'Tapo Plug' }],
        },
      });
    });
  });
});
