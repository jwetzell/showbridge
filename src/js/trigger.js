const _ = require('lodash');
const Action = require('./action');
const { logger } = require('./utils/helper');

class Trigger {
  constructor(triggerObj) {
    this.type = triggerObj.type;
    this.params = triggerObj.params;
    this.actions = triggerObj.actions.map((action) => new Action(action));
    this.enabled = triggerObj.enabled;
  }

  getEnabled() {
    return this.enabled;
  }

  shouldFire(msg) {
    if (!this.enabled) {
      return false;
    }

    let fire = false;
    switch (this.type) {
      case 'regex':
        if (this.params) {
          if (!!this.params.patterns && !!this.params.properties) {
            if (this.params.patterns.length === this.params.properties.length) {
              // assume the regex will pass
              fire = true;
              for (let i = 0; i < this.params.patterns.length; i += 1) {
                const pattern = this.params.patterns[i];
                const property = this.params.properties[i];

                const regex = new RegExp(pattern, 'g');
                const matchPropertyValue = _.get(msg, property);
                if (matchPropertyValue === undefined) {
                  logger.error(
                    'trigger: regex is configured to look at a property that does not exist on this message.'
                  );
                  // bad property config = no fire and since all must match we can stop here
                  fire = false;
                  break;
                }
                if (!regex.test(matchPropertyValue)) {
                  // property value doesn't fit regex = no fire and since all must match we can stop here
                  fire = false;
                  break;
                }
              }
            } else {
              logger.error('trigger: regex trigger requires a 1:1 between patterns and properties');
            }
          }
        }
        break;
      case 'sender':
        if (_.has(msg, 'sender')) {
          if (msg.sender.address === this.params.address) {
            fire = true;
          }
        } else {
          logger.error('trigger: host trigger attempted on message type that does not have host information');
        }
        break;
      case 'bytes-equal':
        if (msg.bytes !== undefined) {
          // good we are looking at a message that has bytes
          const bytesToMatch = Uint8Array.from(this.params.bytes);
          if (_.isEqual(msg.bytes, bytesToMatch)) {
            fire = true;
          }
        } else {
          logger.error('trigger: bytes equality check attempted on msg that does not have bytes');
        }
        break;
      case 'midi-note-on':
        if (msg.messageType === 'midi' && msg.status === 'note_on') {
          if (this.params) {
            fire = true;

            if (_.has(this.params, 'port') && this.params.port !== msg.port) {
              fire = false;
            }

            if (_.has(this.params, 'note') && this.params.note !== msg.note) {
              fire = false;
            }

            if (_.has(this.params, 'velocity') && this.params.velocity !== msg.velocity) {
              fire = false;
            }
          }
        }
        break;
      case 'midi-note-off':
        if (msg.messageType === 'midi' && msg.status === 'note_off') {
          if (this.params) {
            fire = true;

            if (_.has(this.params, 'port') && this.params.port !== msg.port) {
              fire = false;
            }

            if (_.has(this.params, 'note') && this.params.note !== msg.note) {
              fire = false;
            }

            if (_.has(this.params, 'velocity') && this.params.velocity !== msg.velocity) {
              fire = false;
            }
          }
        }
        break;
      case 'midi-control-change':
        if (msg.messageType === 'midi' && msg.status === 'control_change') {
          if (this.params) {
            fire = true;

            if (_.has(this.params, 'port') && this.params.port !== msg.port) {
              fire = false;
            }

            if (_.has(this.params, 'control') && this.params.control !== msg.control) {
              fire = false;
            }

            if (_.has(this.params, 'value') && this.params.value !== msg.value) {
              fire = false;
            }
          }
        }
        break;
      case 'midi-program-change':
        if (msg.messageType === 'midi' && msg.status === 'program_change') {
          if (this.params) {
            fire = true;

            if (_.has(this.params, 'port') && this.params.port !== msg.port) {
              fire = false;
            }

            if (_.has(this.params, 'program') && this.params.program !== msg.program) {
              fire = false;
            }
          }
        }
        break;
      case 'osc-address':
        if (msg.messageType === 'osc') {
          if (!!this.params && this.params.address !== undefined) {
            // NOTE(jwetzell) convert osc wildcard into regex
            const regexString = this.params.address
              .replaceAll('{', '(')
              .replaceAll('}', ')')
              .replaceAll(',', '|')
              .replaceAll('[!', '[^')
              .replaceAll('*', '[^/]+')
              .replaceAll('?', '.');
            const addressRegex = new RegExp(`^${regexString}$`);
            if (addressRegex.test(msg.address)) {
              fire = true;
            }
          }
        } else {
          logger.error('trigger: osc-address only works with osc messages');
        }
        break;
      default:
        logger.error(`trigger: unhandled trigger type = ${this.type}`);
        fire = false;
    }
    return fire;
  }
}
module.exports = Trigger;
