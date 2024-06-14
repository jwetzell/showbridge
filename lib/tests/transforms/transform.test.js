/* eslint-disable no-template-curly-in-string */
import assert from 'node:assert';
import { describe, mock, test } from 'node:test';
import Transform from '../../dist/lib/transforms/transform.js';

describe('Transform', () => {
  test('create', () => {
    const transform = new Transform({
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });
    assert.notEqual(transform, undefined);
    assert.strictEqual(transform.type, 'test');
    assert.deepStrictEqual(transform.params, { key1: 'value1' });

    transform.transform({}, {});
  });

  test('transform enabled', () => {
    const transform = new Transform({
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });

    transform._transform = mock.fn(() => {});

    transform.transform({}, {});
    assert.strictEqual(transform._transform.mock.calls.length, 1);
  });

  test('transform disabled', () => {
    const transform = new Transform({
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: false,
    });

    transform._transform = mock.fn(() => {});

    transform.transform({}, {});
    assert.strictEqual(transform._transform.mock.calls.length, 0);
  });

  test('type getter', () => {
    const transform = new Transform({
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });
    assert.strictEqual(transform.type, 'test');
  });

  test('params getter', () => {
    const transform = new Transform({
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });

    assert.deepStrictEqual(transform.params, { key1: 'value1' });
  });

  test('comment getter', () => {
    const transform = new Transform({
      comment: 'comment',
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });

    assert.strictEqual(transform.comment, 'comment');
  });

  test('templated params', () => {
    const transform = new Transform({
      type: 'test',
      params: {
        _key1: '${data}',
      },
      enabled: true,
    });

    const params = transform.resolveTemplatedParams({ data: 'templated' });
    assert.deepStrictEqual(params, { key1: 'templated' });
  });

  test('toJSON', () => {
    const transform = new Transform({
      comment: 'comment',
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });

    assert.deepStrictEqual(transform.toJSON(), {
      comment: 'comment',
      type: 'test',
      params: {
        key1: 'value1',
      },
      enabled: true,
    });
  });
});
