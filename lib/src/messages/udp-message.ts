import { UDPSender } from '@showbridge/types';

class UDPMessage {
  private msg: Buffer;
  sender: UDPSender;

  constructor(msg: Buffer, sender: UDPSender) {
    this.msg = msg;

    this.sender = sender;
    if (this.sender?.address.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  get messageType() {
    return 'udp';
  }

  get bytes() {
    return Uint8Array.from(this.msg);
  }

  set bytes(bytes) {
    this.msg = Buffer.from(bytes);
  }

  get string() {
    return this.msg.toString();
  }

  set string(string) {
    this.msg = Buffer.from(string);
  }

  toString() {
    return this.string;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: this.msg,
      sender: this.sender,
    };
  }

  static fromJSON(json) {
    return new UDPMessage(json.msg, json.sender);
  }
}
export default UDPMessage;
