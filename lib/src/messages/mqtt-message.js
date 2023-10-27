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
    if (typeof this.payload === 'object') {
      return JSON.stringify(this.payload);
    }
    return this.payload;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      ...this,
    };
  }

  static fromJSON(json) {
    return new MQTTMessage(json.msg, json.topic);
  }
}
export default MQTTMessage;
