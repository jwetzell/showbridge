import { EventEmitter } from 'events';
import { has } from 'lodash-es';
import mqtt from 'mqtt';
import { MQTTMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';

class MQTTProtocol extends EventEmitter {
  reload(params) {
    if (this.client !== undefined) {
      this.client.end();
    }
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
      this.emit('message', mqttMsg);
    });

    this.client.on('close', () => {
      this.emit('stopped');
    });
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
    this.emit('send', { topic, payload });
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

  // TODO(jwetzell): fill this out
  get status() {
    const status = {
      connected: this.client?.connected !== undefined ? this.client.connected : false,
    };
    return status;
  }
}

export default MQTTProtocol;
