import assert from 'node:assert';
import { describe, test } from 'node:test';
import MapTransform from '../../dist/lib/transforms/map-transform.js';

describe('MapTransform', () => {
  test('create', () => {
    const transform = new MapTransform({
      type: 'map',
      params: { property: 'test', map: { M: 'Monday', W: 'Wednesday' } },
      enabled: true,
    });
    assert.notEqual(transform, undefined);
  });

  test('complete params', () => {
    const transform = new MapTransform({
      type: 'map',
      params: { property: 'test', map: { M: 'Monday', W: 'Wednesday' } },
      enabled: true,
    });
    const msg = { test: 'M' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 'Monday');
  });

  test('missing map', () => {
    const transform = new MapTransform({ type: 'map', params: { property: 'test' }, enabled: true });
    const msg = { data: 'templated' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, undefined);
  });

  test('missing property', () => {
    const transform = new MapTransform({
      type: 'map',
      params: { map: { M: 'Monday', W: 'Wednesday' } },
      enabled: true,
    });
    const msg = { data: 'templated' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, undefined);
  });
});
