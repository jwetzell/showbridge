export type TCPSender = {
  protocol: 'tcp';
  address: string;
  port: number;
};

export type UDPSender = {
  protocol: 'udp';
  address: string;
  port: number;
};

export type OSCSender = UDPSender | TCPSender;

export type HTTPSender = {
  protocol: 'tcp';
  address: string;
};

export type WebSocketSender = {
  protocol: 'tcp';
  address: string;
  port: number;
};
