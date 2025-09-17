import { Decoder } from '@jwetzell/posistagenet';
import { UDPSender } from '@showbridge/types';

class PSNMessage {
  sender: UDPSender;
  decoder: Decoder;

  constructor(decoder: Decoder, sender: UDPSender) {
    this.decoder = decoder;
    this.sender = sender;
    if (this.sender?.address.substr(0, 7) === '::ffff:') {
      this.sender.address = this.sender.address.substr(7);
    }
  }

  get messageType() {
    return 'psn';
  }

  toString() {
    // TODO(jwetzell): what should the string format of this be?
    return `${this.decoder.systemName} (tracker count: ${Object.keys(this.decoder.trackers).length})`;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      decoder: this.decoder,
      sender: this.sender,
    };
  }

  static fromJSON(json) {
    return new PSNMessage(json.decoder, json.sender);
  }
}
export default PSNMessage;
