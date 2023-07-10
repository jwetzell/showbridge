class MQTTMessage {
  constructor(msg, topic) {
    this.msg = msg;
    this.topic = topic;
  }

  get messageType() {
    return 'mqtt';
  }

  get payload() {
    try {
      return JSON.parse(this.msg.toString());
    } catch (error) {
      return this.msg.toString();
    }
  }

  set payload(payload) {
    this.msg = Buffer.from(payload);
  }

  get bytes() {
    return Uint8Array.from(this.msg);
  }

  toString() {
    switch (this.payloadType) {
      case 'json':
        return JSON.stringify(this.payload);
      case 'text':
        return this.payload;
      default:
        break;
    }
  }
}
module.exports = MQTTMessage;
