const events = require('events');
const mqtt = require('mqtt');
const { has } = require('lodash');
const MQTTMessage = require('../messages/mqtt-message');
const { logger } = require('../utils/helper');

class MQTTClient {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(params) {
    if (this.client !== undefined) {
      this.client.end();
    }
    const connectionOptions = {
      reconnectPeriod: 0,
    };

    if (params.broker !== undefined && params.broker !== '' && params.topics) {
      if (has(params, 'username') && has(params, 'password')) {
        connectionOptions.username = params.username;
        connectionOptions.password = params.password;
      }

      this.client = mqtt.connect(params.broker, connectionOptions);

      this.client.on('error', (error) => {
        logger.error(`mqtt: problem connecting to broker ${params.broker} - ${error}`);
      });

      this.client.on('connect', () => {
        logger.debug(`mqtt: client connected to ${params.broker}`);
        if (params.topics?.length > 0) {
          this.client.subscribe(params.topics, (error) => {
            if (error) {
              logger.error(`mqtt: problem subscribing to topics ${params.topics} - ${error}`);
            }
          });
        }
      });

      this.client.on('message', (topic, message) => {
        const mqttMsg = new MQTTMessage(message, topic);
        this.eventEmitter.emit('message', mqttMsg);
      });
    }
  }

  send(topic, payload) {
    if (this.client !== undefined) {
      this.client.publish(topic, Buffer.from(payload));
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = MQTTClient;
