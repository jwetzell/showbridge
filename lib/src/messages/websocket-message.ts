import { RawData } from 'ws';

type WebSocketSender = {
  protocol: 'tcp';
  address: string;
  port: number;
};

export type WebUIPayload = {
  eventName: string;
  data: {
    [key: string]: any;
  };
};

class WebSocketMessage {
  private msg: string;
  sender: WebSocketSender;
  processedPayload: string | WebUIPayload | any;

  constructor(msg: RawData, sender: WebSocketSender) {
    this.payload = msg.toString();
    this.sender = sender;

    if (this.sender?.address?.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  processPayload(): string | any {
    try {
      this.processedPayload = JSON.parse(this.msg.toString());
    } catch (error) {
      this.processedPayload = this.msg.toString();
    }
  }

  get messageType() {
    return 'ws';
  }

  get payload() {
    return this.processedPayload;
  }

  set payload(payload: string) {
    this.msg = payload;
    this.processPayload();
  }

  get bytes(): Buffer {
    return Buffer.from(this.msg.toString());
  }

  toString(): string {
    return this.msg.toString();
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: this.msg,
      sender: this.sender,
    };
  }

  static fromJSON(json) {
    return new WebSocketMessage(json.msg, json.sender);
  }
}
export default WebSocketMessage;
