import assert from 'node:assert';
import { describe, test } from 'node:test';
import RoundTransform from '../../src/transforms/round-transform.js';

describe('RoundTransform', () => {
  test('create', () => {
    const transform = new RoundTransform({ type: 'round', params: { property: 'test' }, enabled: true });
    assert.notEqual(transform, undefined);
  });

  test('positive value', () => {
    const transform = new RoundTransform({ type: 'round', params: { property: 'test' }, enabled: true });
    const msg = { test: 100.6565 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 101);
  });

  test('negative value', () => {
    const transform = new RoundTransform({ type: 'round', params: { property: 'test' }, enabled: true });
    const msg = { test: -100.6565 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, -101);
  });

  test('missing property', () => {
    const transform = new RoundTransform({ type: 'round', params: {}, enabled: true });
    const msg = { test: 100 };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 100);
  });

  test("property value isn't a number", () => {
    const transform = new RoundTransform({ type: 'round', params: { property: 'test' }, enabled: true });
    const msg = { test: 'string' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 'string');
  });
});
