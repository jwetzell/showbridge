import { EventEmitter } from 'events';
import { has } from 'lodash-es';
import mqtt from 'mqtt';
import { MQTTMessage } from '../messages/index.js';
import { disabled, logger } from '../utils/index.js';

class MQTTProtocol extends EventEmitter {
  reload(params) {
    if (!has(params, 'broker') || params.broker === '') {
      logger.debug('mqtt: no broker configured skipping reload');
      return;
    }

    if (!has(params, 'topics') || params.topics.length === 0) {
      logger.debug('mqtt: no topics configured skipping reload');
      return;
    }

    const connectionOptions = {
      reconnectPeriod: 0,
    };

    if (has(params, 'username') && has(params, 'password')) {
      connectionOptions.username = params.username;
      connectionOptions.password = params.password;
    }

    if (this.client !== undefined) {
      this.client.reconnect(connectionOptions);
    } else {
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
        this.emit('messageIn', mqttMsg);
      });

      this.client.on('close', () => {
        this.emit('stopped');
      });
    }
  }

  send(topic, payload) {
    if (this.client === undefined) {
      logger.error('mqtt: client does not exist');
      return;
    }

    if (!this.client.connected) {
      logger.error('mqtt: client is not connected');
      return;
    }

    this.client.publish(topic, Buffer.from(payload));
  }

  stop() {
    if (this.client) {
      if (this.client.connected) {
        this.client.end(true);
      } else {
        this.emit('stopped');
      }
    } else {
      this.emit('stopped');
    }
  }

  get status() {
    const status = {
      enabled: !disabled.protocols.has('mqtt'),
      connected: this.client?.connected !== undefined ? this.client.connected : false,
      broker: this.client?.options?.href,
    };
    return status;
  }
}

export default MQTTProtocol;
