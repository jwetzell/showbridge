const events = require('events');
const mqtt = require('mqtt');
const MQTTMessage = require('../models/message/mqtt-message');

class MQTTServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(params) {
    if (this.client) {
      this.client.end();
    }
    if (params.broker !== '') {
      this.client = mqtt.connect(params.broker);

      this.client.on('connect', () => {
        console.log(`mqtt client connected to ${params.broker}`);
        this.client.subscribe(params.topics, (err) => {
          if (err) {
            console.error(err);
          }
        });
      });

      this.client.on('message', (topic, message) => {
        const mqttMsg = new MQTTMessage(message, topic);
        this.eventEmitter.emit('message', mqttMsg, 'mqtt');
      });
    } else {
      console.log('no mqtt broker configured');
    }
  }

  send(topic, payload) {
    if (this.client) {
      this.client.publish(topic, Buffer.from(payload));
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = MQTTServer;
