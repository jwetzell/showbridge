import { Trigger } from './trigger.model';

export interface ConfigFileSchema {
  [key: string]: ProtocolConfiguration;
}

export interface ProtocolConfiguration {
  params?: {
    [k: string]: string | number;
  };
  triggers?: Trigger[];
}

export interface CloudConfiguration {
  params:
    | {
        url: string;
        room: string;
      }
    | {
        url: string;
        rooms: string[];
      };
}

export type MessageType = 'ws' | 'osc' | 'http' | 'midi' | 'udp' | 'tcp' | 'mqtt';
export type TriggerType =
  | 'bytes-equal'
  | 'midi-control-change'
  | 'midi-note-off'
  | 'midi-note-on'
  | 'midi-program-change'
  | 'osc-address'
  | 'regex'
  | 'sender';
