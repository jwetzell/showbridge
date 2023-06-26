const _ = require('lodash');
const Action = require('./action');

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

  shouldFire(msg, messageType) {
    if (!this.enabled) {
      return false;
    }

    let fire = false;
    switch (this.type) {
      case 'regex':
        if (!!this.params) {
          if (!!this.params.patterns && !!this.params.properties) {
            if (this.params.patterns.length === this.params.properties.length) {
              // assume the regex will pass
              fire = true;
              for (let i = 0; i < this.params.patterns.length; i++) {
                const pattern = this.params.patterns[i];
                const property = this.params.properties[i];

                const regex = new RegExp(pattern, 'g');
                const matchPropertyValue = _.get(msg, property);
                if (!matchPropertyValue) {
                  console.error('regex is configured to look at a property that does not exist on this message.');
                  //bad property config = no fire and since all must match we can stop here
                  fire = false;
                  break;
                }

                if (!regex.test(matchPropertyValue)) {
                  //property value doesn't fit regex = no fire and since all must match we can stop here
                  fire = false;
                  break;
                }
              }
            }
          }
        }
        break;
      case 'sender':
        if (!!msg.sender) {
          if (msg.sender.address === this.params.address) {
            fire = true;
          }
        } else {
          console.error('host trigger attempted on message type that does not have host information');
        }
        break;
      case 'bytes-equal':
        if (msg.bytes) {
          //good we are looking at a message that has bytes
          const bytesToMatch = Uint8Array.from(this.params.bytes);
          if (_.isEqual(msg.bytes, bytesToMatch)) {
            fire = true;
          }
        } else {
          console.error('bytes equality check attempted on msg that does not have bytes');
        }
        break;
      case 'midi-note-on':
        if (messageType === 'midi' && msg.status === 'note_on') {
          if (!!this.params) {
            fire = true;
            if (!!this.params.note && this.params.note !== msg.note) {
              fire = false;
            }

            if (!!this.params.velocity && this.params.velocity !== msg.velocity) {
              fire = false;
            }
          }
        }
        break;
      case 'midi-note-off':
        if (messageType === 'midi' && msg.status === 'note_off') {
          if (!!this.params) {
            fire = true;
            if (!!this.params.note && this.params.note !== msg.note) {
              fire = false;
            }

            if (!!this.params.velocity && this.params.velocity !== msg.velocity) {
              fire = false;
            }
          }
        }
        break;
      default:
        console.log(`unhandled trigger type = ${this.type}`);
        fire = false;
    }
    return fire;
  }
}
module.exports = Trigger;
