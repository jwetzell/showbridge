/* eslint-disable no-template-curly-in-string */
import assert from 'node:assert';
import { describe, mock, test } from 'node:test';
import { Trigger } from '../../src/triggers/index.js';

describe('Trigger', () => {
  test('create', () => {
    const trigger = new Trigger({
      type: 'test',
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.notEqual(trigger, undefined);
    trigger.shouldFire({});
  });

  test('enabled', () => {
    const trigger = new Trigger({
      type: 'test',
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    trigger.test = mock.fn(() => {});
    trigger.shouldFire({});
    assert.strictEqual(trigger.test.mock.calls.length, 1);
  });

  test('disabled', () => {
    const trigger = new Trigger({
      type: 'test',
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: false,
    });

    trigger.test = mock.fn(() => {});
    trigger.shouldFire({});
    assert.strictEqual(trigger.test.mock.calls.length, 0);
  });

  test('subTriggers', () => {
    const trigger = new Trigger({
      type: 'any',
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      subTriggers: [
        {
          type: 'any',
          actions: [{ type: 'log', enabled: true }],
          enabled: true,
        },
      ],
      enabled: true,
    });

    trigger.test = mock.fn(() => {});
    trigger.shouldFire({});
    assert.strictEqual(trigger.test.mock.calls.length, 1);
  });

  test('params getter', () => {
    const trigger = new Trigger({
      type: 'test',
      params: {
        key1: 'value1',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.deepStrictEqual(trigger.params, { key1: 'value1' });
  });

  test('resolveTemplatedParams', () => {
    const trigger = new Trigger({
      type: 'test',
      params: {
        _key1: '${data}',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const params = trigger.resolveTemplatedParams({ data: 'templated' });
    assert.deepStrictEqual(params, { key1: 'templated' });
  });

  test('toJSON', () => {
    const trigger = new Trigger({
      type: 'test',
      params: {
        key1: 'value1',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.deepStrictEqual(trigger.toJSON(), {
      comment: undefined,
      type: 'test',
      params: {
        key1: 'value1',
      },
      subTriggers: [],
      actions: [
        {
          comment: undefined,
          type: 'log',
          transforms: [],
          params: undefined,
          enabled: true,
        },
      ],
      enabled: true,
    });
  });
});
