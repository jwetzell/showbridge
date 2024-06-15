import assert from 'node:assert';
import { describe, test } from 'node:test';
import StoreAction from '../../dist/lib/actions/store-action.js';
import MIDIMessage from '../../dist/lib/messages/midi-message.js';

describe('StoreAction', () => {
  test('create', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        key: 'key1',
        value: 'value1',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);
  });

  test('simple params', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        key: 'key1',
        value: 'value1',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.strictEqual(vars.key1, 'value1');
  });

  test('missing key', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        value: 'value1',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.deepStrictEqual(vars, {});
  });

  test('missing value', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        key: 'key1',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.deepStrictEqual(vars.key1, undefined);
  });

  test('templated key', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        _key: '${msg.status}',
        value: 'test',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.strictEqual(vars.note_off, 'test');
  });

  test('templated value', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        key: 'last_note',
        _value: '${msg.note}',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.strictEqual(vars.last_note, 60);
  });

  test('templated params', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        _key: '${msg.status}',
        _value: '${msg.note}',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.strictEqual(vars.note_off, 60);
  });

  test('bad template for key', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        _key: '${test.status}',
        _value: '${msg.note}',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.deepStrictEqual(vars, {});
  });

  test('bad template for value', () => {
    const action = new StoreAction({
      type: 'store',
      params: {
        _key: '${msg.status}',
        _value: '${test.note}',
      },
      transforms: [],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    const vars = {};
    action.run(new MIDIMessage([0x80, 60, 127], 'test'), vars);

    assert.deepStrictEqual(vars, {});
  });
});
