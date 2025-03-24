import { TriggerObj, TriggerParams } from '@showbridge/types';

export type HandlersConfiguration = { [key: string]: HandlerConfiguration };
export type ProtocolsConfiguration = { [key: string]: ProtocolConfiguration };

export type ConfigFile = {
  protocols: ProtocolsConfiguration;
  handlers: HandlersConfiguration;
};

export type HandlerConfiguration = {
  params?: {
    [k: string]: string | number;
  };
  triggers?: TriggerObj<TriggerParams>[];
};
export type ProtocolConfiguration = {
  params?: {
    [k: string]: string | number;
  };
  triggers?: TriggerObj<TriggerParams>[];
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
