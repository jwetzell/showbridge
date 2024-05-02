import assert from 'node:assert';
import { describe, test } from 'node:test';
import { resolveAllKeys, resolveTemplatedProperty } from '../../src/utils/templating.js';
describe('templating', () => {
  describe('resolveAllKeys', () => {
    test('no templates', () => {
      const params = {
        key1: 'value1',
        key2: 'value2',
      };
      const data = {};
      const resolved = resolveAllKeys(params, data);
      assert.equal(resolved.key1, 'value1');
      assert.equal(resolved.key2, 'value2');
    });

    test('template only', () => {
      const params = {
        _key1: 'value1',
        _key2: '${value2}',
      };
      const data = {
        value2: 'templated',
      };
      const resolved = resolveAllKeys(params, data);
      assert.equal(resolved.key1, 'value1');
      assert.equal(resolved.key2, 'templated');
    });

    test('standard key and template override ', () => {
      const params = {
        key1: 'value1',
        _key1: '${value1}',
      };
      const data = {
        value1: 'templated',
      };
      const resolved = resolveAllKeys(params, data);
      assert.equal(resolved.key1, 'templated');
    });
  });
  describe('resolveTemplatedProperty', () => {
    test('template property exists', () => {
      const params = {
        _key1: '${value1}',
      };
      const data = {
        value1: 'templated',
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      console.log(resolved);
      assert.equal(resolved, data.value1);
    });

    test('template property does not exist but key does', () => {
      const params = {
        key1: 'value1',
      };
      const data = {};
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.equal(resolved, 'value1');
    });

    test('template property and key does not exist', () => {
      const params = {
        _key1: '${value1}',
      };
      const data = {
        value1: 'templated',
      };
      const resolved = resolveTemplatedProperty(params, 'key2', data);
      assert.equal(resolved, undefined);
    });

    test('template property is an array', () => {
      const params = {
        _key1: ['${value1}', 'value2'],
      };
      const data = {
        value1: 'templated',
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.deepEqual(resolved, ['templated', 'value2']);
    });

    test('template property is an array with an integer', () => {
      const params = {
        _key1: ['${value1}', 'value2'],
      };
      const data = {
        value1: '1',
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.deepStrictEqual(resolved, [1, 'value2']);
    });

    test('template property is an array with a float', () => {
      const params = {
        _key1: ['${value1}', 'value2'],
      };
      const data = {
        value1: '1.0',
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.deepStrictEqual(resolved, [1.0, 'value2']);
    });

    test('template property is an array with true', () => {
      const params = {
        _key1: ['${value1}', 'value2'],
      };
      const data = {
        value1: true,
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.deepStrictEqual(resolved, [true, 'value2']);
    });

    test('template property is an array with false', () => {
      const params = {
        _key1: ['${value1}', 'value2'],
      };
      const data = {
        value1: false,
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.deepStrictEqual(resolved, [false, 'value2']);
    });

    test('template property is an integer', () => {
      const params = {
        _key1: '${value1}',
      };
      const data = {
        value1: '1',
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.strictEqual(resolved, 1);
    });

    test('template property is a float', () => {
      const params = {
        _key1: '${value1}',
      };
      const data = {
        value1: '1.0',
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.strictEqual(resolved, 1.0);
    });

    test('template property is true', () => {
      const params = {
        _key1: '${value1}',
      };
      const data = {
        value1: true,
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.strictEqual(resolved, true);
    });

    test('template property is false', () => {
      const params = {
        _key1: '${value1}',
      };
      const data = {
        value1: false,
      };
      const resolved = resolveTemplatedProperty(params, 'key1', data);
      assert.strictEqual(resolved, false);
    });
  });
});
