import assert from 'node:assert';
import { describe, test } from 'node:test';
import OSCMessage from '../../dist/lib/messages/osc-message.js';
import { RegexTrigger } from '../../dist/lib/triggers/index.js';

describe('RegexTrigger', () => {
  test('create', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        properties: ['address'],
        patterns: ['^/midi.*$'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.notEqual(trigger, undefined);
  });

  test('simple regex match', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        properties: ['address'],
        patterns: ['^/valid.*$'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.notEqual(trigger, undefined);
    const fired = trigger.test(new OSCMessage({ address: '/valid', args: [] }, { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, true);
  });

  test('simple regex mismatch', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        properties: ['address'],
        patterns: ['^/valid.*$'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.test(new OSCMessage({ address: '/invalid', args: [] }, { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, false);
  });

  test('missing patterns', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        properties: ['address'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.test(new OSCMessage({ address: '/invalid', args: [] }, { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, false);
  });

  test('missing properties', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        patterns: ['^/valid.*$'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.test(new OSCMessage({ address: '/invalid', args: [] }, { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, false);
  });

  test('properties and patterns length mismatch', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        properties: ['key1', 'key2'],
        patterns: ['^/valid.*$'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.test(new OSCMessage({ address: '/invalid', args: [] }, { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, false);
  });

  test('property does not exist', () => {
    const trigger = new RegexTrigger({
      type: 'regex',
      params: {
        properties: ['key1'],
        patterns: ['^/valid.*$'],
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.test(new OSCMessage({ address: '/invalid', args: [] }, { address: '127.0.0.1', port: 0 }));
    assert.strictEqual(fired, false);
  });

  // TODO(jwetzell): add more complicated regex tests
});
