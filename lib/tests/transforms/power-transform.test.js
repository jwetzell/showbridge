import assert from 'node:assert';
import { describe, test } from 'node:test';
import PowerTransform from '../../src/transforms/power-transform.js';
describe('PowerTransform', () => {
  test('create', () => {
    const transform = new PowerTransform({ type: 'power', params: { property: 'test', power: 4 }, enabled: true });
    assert.notEqual(transform, undefined);
  });

  test('complete params', () => {
    const transform = new PowerTransform({ type: 'power', params: { property: 'test', power: 4 }, enabled: true });
    const msg = { test: 2 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 16);
  });

  test('missing power', () => {
    const transform = new PowerTransform({ type: 'power', params: { property: 'test' }, enabled: true });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, NaN);
  });

  test('missing property', () => {
    const transform = new PowerTransform({ type: 'power', params: { power: 4 }, enabled: true });
    const msg = { test: 2 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 2);
  });

  test("property value isn't a number", () => {
    const transform = new PowerTransform({ type: 'power', params: { property: 'test', power: 4 }, enabled: true });
    const msg = { test: 'string' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 'string');
  });
});
