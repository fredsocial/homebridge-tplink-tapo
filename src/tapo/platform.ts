import type {
  API,
  Characteristic,
  Logging,
  Service,
  WithUUID,
} from 'homebridge';

import type { TplinkSmarthomeConfig } from '../config';

export interface TapoPlatform {
  readonly Service: typeof Service;
  readonly Characteristic: typeof Characteristic;
  readonly FakeGatoHistoryService: new (
    type: string,
    accessory: unknown,
    options: Record<string, unknown>
  ) => {
    addEntry(entry: Record<string, unknown>): void;
  };
  readonly api: API;
  readonly config: TplinkSmarthomeConfig;
  readonly customCharacteristics: Record<
    string,
    WithUUID<new () => Characteristic>
  >;
  readonly log: Logging;
}
