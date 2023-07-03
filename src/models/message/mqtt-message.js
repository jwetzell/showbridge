class MQTTMessage {
  constructor(msg, topic) {
    this.bytes = msg;

    try {
      this.payload = JSON.parse(msg.toString());
      this.payloadType = 'json';
    } catch (err) {
      this.payload = msg.toString();
      this.payloadType = 'text';
    }
    this.topic = topic;
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
