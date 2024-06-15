/* eslint-disable no-template-curly-in-string */
import assert from 'node:assert';
import { describe, mock, test } from 'node:test';
import Action from '../../dist/lib/actions/action.js';

describe('Action', () => {
  test('create', () => {
    const action = new Action({
      type: 'test',
      transforms: [
        {
          type: 'transform',
          params: {
            property: 'test',
            template: '${data}',
          },
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.notEqual(action, undefined);
    action.run();
  });

  test('run enabled', () => {
    const action = new Action({
      type: 'test',
      enabled: true,
    });

    action._run = mock.fn(() => {});

    assert.notEqual(action, undefined);
    action.run({}, {}, {});
    assert.strictEqual(action._run.mock.calls.length, 1);
  });

  test('run disabled', () => {
    const action = new Action({
      type: 'test',
      enabled: false,
    });

    action._run = mock.fn(() => {});

    assert.notEqual(action, undefined);
    action.run({}, {}, {});
    assert.strictEqual(action._run.mock.calls.length, 0);
  });

  test('run disabled', () => {
    const action = new Action({
      type: 'test',
      enabled: false,
    });

    action._run = mock.fn(() => {});

    assert.notEqual(action, undefined);
    action.run({}, {}, {});
    assert.strictEqual(action._run.mock.calls.length, 0);
  });

  test('templated params', () => {
    const action = new Action({
      type: 'test',
      params: {
        _key1: '${data}',
        test: 'value',
      },
      transforms: [
        {
          type: 'transform',
          params: {
            property: 'test',
            template: '${data}',
          },
          enabled: true,
        },
      ],
      enabled: true,
    });

    const params = action.resolveTemplatedParams({ data: 'templated' });

    assert.deepEqual(params, { key1: 'templated', test: 'value' });
  });

  test('comment', () => {
    const action = new Action({
      comment: 'this is a test',
      type: 'test',
      params: {
        _key1: '${data}',
        test: 'value',
      },
      transforms: [
        {
          type: 'transform',
          params: {
            property: 'test',
            template: '${data}',
          },
          enabled: true,
        },
      ],
      enabled: true,
    });

    assert.strictEqual(action.comment, 'this is a test');
  });

  test('empty transforms', () => {
    const action = new Action({
      type: 'test',
      transforms: [],
      enabled: true,
    });

    const msg = action.getTransformedMessage({ test: 'initial' }, { data: 'templated' });
    assert.strictEqual(msg.test, 'initial');
  });

  test('single transform', () => {
    const action = new Action({
      type: 'test',
      transforms: [
        {
          type: 'template',
          params: {
            property: 'test',
            template: '${vars.data}',
          },
          enabled: true,
        },
      ],
      enabled: true,
    });

    const msg = action.getTransformedMessage({ test: 'initial' }, { data: 'templated' });
    assert.strictEqual(msg.test, 'templated');
  });

  test('multiple transforms', () => {
    const action = new Action({
      type: 'test',
      transforms: [
        {
          type: 'template',
          params: {
            property: 'test',
            template: '${vars.data}',
          },
          enabled: true,
        },
        {
          type: 'template',
          params: {
            property: 'test',
            template: '${vars.data2}',
          },
          enabled: true,
        },
      ],
      enabled: true,
    });

    const msg = action.getTransformedMessage({ test: 'initial' }, { data: 'templated', data2: 'altered' });
    assert.strictEqual(msg.test, 'altered');
  });

  test('toJSON', () => {
    const action = new Action({
      comment: 'comment',
      type: 'test',
      transforms: [],
      enabled: true,
    });

    const json = action.toJSON();

    assert.strictEqual(json.comment, 'comment');
    assert.strictEqual(json.type, 'test');
    assert.deepStrictEqual(json.transforms, []);
    assert.strictEqual(json.enabled, true);
  });
});
