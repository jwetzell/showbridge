export type CloudProtocolParams = {
  url?: string;
  rooms?: string[];
};

export type HTTPProtocolParams = {
  address?: string;
  port: number;
};

export type MIDIProtocolParams = {
  virtualInputName?: string;
  virtualOutputName?: string;
};

export type MQTTProtocolParams = {
  broker: string;
  username?: string;
  password?: string;
  topics?: string[];
};

export type TCPProtocolParams = {
  address?: string;
  port: number;
};

export type UDPProtocolParams = {
  address?: string;
  port: number;
};

export type PSNProtocolParams = {
  address?: string;
  port?: number;
};

export type ProtocolParams =
  | CloudProtocolParams
  | HTTPProtocolParams
  | MIDIProtocolParams
  | MQTTProtocolParams
  | TCPProtocolParams
  | UDPProtocolParams
  | PSNProtocolParams;
