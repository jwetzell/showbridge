import { Trigger } from './trigger.model';

export type ConfigFile = {
  [key: string]: ProtocolConfiguration;
};

export type ProtocolConfiguration = {
  params?: {
    [k: string]: string | number;
  };
  triggers?: Trigger[];
};

export type CloudConfiguration = {
  params:
    | {
        url: string;
        room: string;
      }
    | {
        url: string;
        rooms: string[];
      };
};

export type ConfigState = {
  config: ConfigFile;
  timestamp: number;
  isLive: boolean;
  isCurrent: boolean;
};
