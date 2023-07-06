const events = require('events');
const mqtt = require('mqtt');
const MQTTMessage = require('../models/message/mqtt-message');

class MQTTClient {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(params) {
    if (this.client) {
      this.client.end();
    }
    const connectionOptions = {
      reconnectPeriod: 0,
    };

    if (params.broker !== '' && params.topics) {
      if (params.username && params.password) {
        connectionOptions.username = params.username;
        connectionOptions.password = params.password;
      }

      this.client = mqtt.connect(params.broker, connectionOptions);

      this.client.on('error', (err) => {
        console.error(`MQTT: problem connecting to broker ${params.broker}`);
        console.error(err);
      });

      this.client.on('connect', () => {
        console.log(`MQTT: client connected to ${params.broker}`);
        if (params.topics?.length > 0) {
          this.client.subscribe(params.topics, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
      });

      this.client.on('message', (topic, message) => {
        const mqttMsg = new MQTTMessage(message, topic);
        this.eventEmitter.emit('message', mqttMsg, 'mqtt');
      });
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

module.exports = MQTTClient;
