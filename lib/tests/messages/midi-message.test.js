import assert from 'node:assert';
import { describe, test } from 'node:test';
import MIDIMessage from '../../src/messages/midi-message.js';

describe('MIDIMessage', () => {
  test('create MIDIMessage', () => {
    const message = new MIDIMessage([0x80, 60, 100], 'test');
    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'midi');
  });

  test('MIDIMessage Note Off', () => {
    const message = new MIDIMessage([0x80, 60, 100], 'test');
    assert.equal(message.status, 'note_off');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0x80, 60, 100]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Note On', () => {
    const message = new MIDIMessage([0x90, 60, 100], 'test');
    assert.equal(message.status, 'note_on');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0x90, 60, 100]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Polyphonic Aftertouch', () => {
    const message = new MIDIMessage([0xa0, 60, 100], 'test');
    assert.equal(message.status, 'polyphonic_aftertouch');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xa0, 60, 100]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Control Change', () => {
    const message = new MIDIMessage([0xb0, 60, 100], 'test');
    assert.equal(message.status, 'control_change');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xb0, 60, 100]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Program Change', () => {
    const message = new MIDIMessage([0xc0, 60], 'test');
    assert.equal(message.status, 'program_change');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xc0, 60]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Channel Aftertouch', () => {
    const message = new MIDIMessage([0xd0, 60], 'test');
    assert.equal(message.status, 'channel_aftertouch');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xd0, 60]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Pitch Bend', () => {
    const message = new MIDIMessage([0xe0, 60, 100], 'test');
    assert.equal(message.status, 'pitch_bend');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xe0, 60, 100]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Start', () => {
    const message = new MIDIMessage([0xfa], 'test');
    assert.equal(message.status, 'start');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xfa]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Continue', () => {
    const message = new MIDIMessage([0xfb], 'test');
    assert.equal(message.status, 'continue');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xfb]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Stop', () => {
    const message = new MIDIMessage([0xfc], 'test');
    assert.equal(message.status, 'stop');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xfc]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage Reset', () => {
    const message = new MIDIMessage([0xff], 'test');
    assert.equal(message.status, 'reset');
    assert.deepEqual(MIDIMessage.objectToBytes(message), [0xff]);

    const toJSON = message.toJSON();

    const fromJSON = MIDIMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });

  test('MIDIMessage equals', () => {
    const message = new MIDIMessage([0x80, 60, 127], 'test');
    assert.equal(message.equals([0x80, 60, 127]), true);
    assert.equal(message.equals([0x80, 61, 127]), false);
  });

  test('MIDIMessage Note Off object parseActionParams', () => {
    const params = {
      status: 'note_off',
      channel: 1,
      note: 60,
      velocity: 127,
    };

    const message = MIDIMessage.parseActionParams(params);
    assert.equal(message.status, 'note_off');
    assert.equal(message.note, 60);
    assert.equal(message.velocity, 127);
    assert.equal(message.channel, 1);
  });

  test('MIDIMessage bytes parseActionParams', () => {
    const params = {
      bytes: [0x90, 60, 127],
    };

    const message = MIDIMessage.parseActionParams(params);
    assert.equal(message.status, 'note_on');
    assert.equal(message.note, 60);
    assert.equal(message.velocity, 127);
    assert.equal(message.channel, 1);
  });

  test('MIDIMessage Note Off invalid parseActionParams', () => {
    const params = {
      status: 'note_off',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });

  test('MIDIMessage Note On invalid parseActionParams', () => {
    const params = {
      status: 'note_on',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });

  test('MIDIMessage Polyphonic Aftertouch invalid parseActionParams', () => {
    const params = {
      status: 'polyphonic_aftertouch',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });

  test('MIDIMessage Control Change invalid parseActionParams', () => {
    const params = {
      status: 'control_change',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });

  test('MIDIMessage Program Change invalid parseActionParams', () => {
    const params = {
      status: 'program_change',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });

  test('MIDIMessage Channel Aftertouch invalid parseActionParams', () => {
    const params = {
      status: 'channel_aftertouch',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });

  test('MIDIMessage Pitch Bend invalid parseActionParams', () => {
    const params = {
      status: 'pitch_bend',
    };

    assert.throws(() => {
      MIDIMessage.parseActionParams(params);
    });
  });
});
