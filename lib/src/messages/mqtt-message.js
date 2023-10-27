class MQTTMessage {
  constructor(msg, topic) {
    this.payload = msg.toString();
    this.topic = topic;
  }

  processPayload() {
    try {
      this.processedPayload = JSON.parse(this.msg);
    } catch (error) {
      this.processedPayload = this.msg;
    }
  }

  get messageType() {
    return 'mqtt';
  }

  get payload() {
    return this.processedPayload;
  }

  set payload(payload) {
    this.msg = payload;
    this.processPayload();
  }

  get bytes() {
    return Buffer.from(this.msg);
  }

  toString() {
    return this.msg;
  }

  toJSON() {
    return {
      messageType: this.messageType,
      msg: this.msg,
      topic: this.topic,
    };
  }

  static fromJSON(json) {
    return new MQTTMessage(json.msg, json.topic);
  }
}
export default MQTTMessage;
