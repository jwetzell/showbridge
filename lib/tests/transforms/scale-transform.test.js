import assert from 'node:assert';
import { describe, test } from 'node:test';
import ScaleTransform from '../../src/transforms/scale-transform.js';

describe('ScaleTransform', () => {
  test('create', () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { property: 'test', inRange: [0, 100], outRange: [0, 10] },
      enabled: true,
    });
    assert.notEqual(transform, undefined);
  });

  test('0,100 -> 0,10', () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { property: 'test', inRange: [0, 100], outRange: [0, 10] },
      enabled: true,
    });
    const msg1 = { test: 50 };
    transform.transform(msg1, {});
    assert.strictEqual(msg1.test, 5);

    const msg2 = { test: 25 };
    transform.transform(msg2, {});
    assert.strictEqual(msg2.test, 2.5);
  });

  test('0,10 => -5,5', () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { property: 'test', inRange: [0, 10], outRange: [-5, 5] },
      enabled: true,
    });
    const msg = { test: 5 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 0);
  });

  test('missing property', () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { inRange: [0, 100], outRange: [0, 10] },
      enabled: true,
    });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 100);
  });

  test('missing inRange', () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { property: 'test', outRange: [0, 10] },
      enabled: true,
    });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 100);
  });

  test('missing outRange', () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { property: 'test', inRange: [0, 100] },
      enabled: true,
    });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 100);
  });

  test("property value isn't a number", () => {
    const transform = new ScaleTransform({
      type: 'scale',
      params: { property: 'test', inRange: [0, 100], outRange: [0, 10] },
      enabled: true,
    });
    const msg = { test: 'string' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 'string');
  });
});
