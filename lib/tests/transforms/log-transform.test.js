import assert from 'node:assert';
import { describe, test } from 'node:test';
import LogTransform from '../../src/transforms/log-transform.js';

describe('LogTransform', () => {
  test('create', () => {
    const transform = new LogTransform({ type: 'log', params: { property: 'test', base: 10 }, enabled: true });
    assert.notEqual(transform, undefined);
  });

  test('complete params', () => {
    const transform = new LogTransform({ type: 'log', params: { property: 'test', base: 10 }, enabled: true });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 2);
  });

  test('missing base', () => {
    const transform = new LogTransform({ type: 'log', params: { property: 'test' }, enabled: true });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, NaN);
  });

  test('missing property', () => {
    const transform = new LogTransform({ type: 'log', params: { base: 10 }, enabled: true });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 100);
  });

  test("property value isn't a number", () => {
    const transform = new LogTransform({ type: 'log', params: { property: 'test', base: 10 }, enabled: true });
    const msg = { test: 'string' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 'string');
  });
});
