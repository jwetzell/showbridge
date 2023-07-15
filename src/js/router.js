const UDPServer = require('./protocols/udp-server');
const TCPServer = require('./protocols/tcp-server');
const MIDIServer = require('./protocols/midi-server');
const WebSocketServer = require('./protocols/websocket-server');
const HTTPServer = require('./protocols/http-server');
const MQTTClient = require('./protocols/mqtt-client');

const { logger } = require('./utils/helper');
const BridgeServer = require('./protocols/bridge-server');

class Router {
  constructor(config) {
    this.vars = {};
    this.config = config;
    this.servers = {
      http: new HTTPServer(),
      udp: new UDPServer(),
      tcp: new TCPServer(),
      midi: new MIDIServer(),
      mqtt: new MQTTClient(),
      bridge: new BridgeServer(),
    };

    this.servers.http.setConfig(this.config);

    // NOTE(jwetzell): listen for all messages on servers
    Object.keys(this.servers).forEach((serverType) => {
      this.servers[serverType].on('message', (msg) => {
        this.processMessage(msg);
      });
    });

    // NOTE(jwetzell): websocket server needs the http server instance to load
    this.servers.http.on('http-server', (server) => {
      this.servers.ws = new WebSocketServer(server);
      this.servers.ws.on('message', (msg) => {
        this.processMessage(msg);
      });
    });

    this.servers.http.on('reload', (updatedConfig) => {
      try {
        this.config = updatedConfig;
        this.reload();
        logger.debug('app: config updated successfully');
      } catch (error) {
        logger.error('app: problem applying new config');
      }
    });
  }

  start() {
    this.reload();
  }

  reload() {
    Object.keys(this.servers).forEach((serverType) => {
      if (this.config[serverType]) {
        if (this.config[serverType].params) {
          this.servers[serverType].reload(this.config[serverType].params);
        } else {
          this.servers[serverType].reload();
        }
      }
    });
  }

  processMessage(msg) {
    const triggers = this.config[msg.messageType]?.triggers;
    if (triggers !== undefined && triggers.length > 0) {
      triggers.forEach((trigger, triggerIndex) => {
        try {
          if (trigger.enabled && trigger.shouldFire(msg)) {
            logger.trace(`${msg.messageType}-trigger-${triggerIndex}: fired`);
            trigger.actions.forEach((action) => {
              if (action.enabled) {
                try {
                  action.do(msg, this.vars, this.servers);
                  logger.debug(`action: ${action.type} triggered from ${trigger.type}`);
                } catch (error) {
                  logger.error(`action: problem running action - ${error}`);
                }
              } else {
                logger.debug(`action: ${action.type} is disabled skipping...`);
              }
            });
          } else {
            logger.trace(`${msg.messageType}-trigger-${triggerIndex}: not fired`);
          }
        } catch (error) {
          logger.error(`trigger: problem evaluating trigger - ${error}`);
        }
      });
    }
  }
}

module.exports = Router;
