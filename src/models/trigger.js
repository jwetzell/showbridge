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
              for (let i = 0; i < this.params.patterns.length; i++) {
                const pattern = this.params.patterns[i];
                const property = this.params.properties[i];

                const regex = new RegExp(pattern, 'g');
                const matchPropertyValue = _.get(msg, property);
                if (!matchPropertyValue) {
                  console.error('regex is configured to look at a property that does not exist on this message.');
                  fire = false;
                }

                if (!regex.test(matchPropertyValue)) {
                  fire = false;
                }
              }
              // all properties match all patterns
              fire = true;
            }
          }
        }
        break;
      case 'sender':
        if (!!msg.sender) {
          const address = this.params.address;
          if (msg.sender.address === this.params.address) {
            fire = true;
          }
        } else {
          console.error('host trigger attempted on message type that does not have host information');
        }
        break;
      case 'midi-bytes-equals':
        if (messageType === 'midi') {
          if (msg.equals(this.params.data)) {
            fire = true;
          }
        }
        break;
      case 'midi-note-on':
        if (messageType === 'midi' && msg.status === 'note_on') {
          if (!!this.params) {
            if (!!this.params.note) {
              //trigger params specify a note (the incoming message must match in order to fire actions)
              if (msg.note === this.params.note) {
                fire = true;
              }
            } else {
              //no note specified always fire actions
              fire = true;
            }
          }
        }
        break;
      case 'midi-note-off':
        if (messageType === 'midi' && msg.status === 'note_off') {
          if (!!this.params) {
            if (!!this.params.note) {
              //trigger params specify a note (the incoming message must match in order to fire actions)
              if (msg.note === this.params.note) {
                fire = true;
              }
            } else {
              //no note specified always fire actions
              fire = true;
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
