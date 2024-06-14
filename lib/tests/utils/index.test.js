import assert from 'node:assert';
import { describe, test } from 'node:test';
import { hexToBytes } from '../../dist/lib/utils/index.js';

describe('hexToBytes', () => {
  test('0x12 0x34 0x56', () => {
    const bytes = hexToBytes('0x12 0x34 0x56');
    assert.deepEqual(bytes, [0x12, 0x34, 0x56]);
  });

  test('0x12, 0x34, 0x56', () => {
    const bytes = hexToBytes('0x12, 0x34, 0x56');
    assert.deepEqual(bytes, [0x12, 0x34, 0x56]);
  });

  test('123456', () => {
    const bytes = hexToBytes('123456');
    assert.deepEqual(bytes, [0x12, 0x34, 0x56]);
  });

  test('12,34,56', () => {
    const bytes = hexToBytes('12,34,56');
    assert.deepEqual(bytes, [0x12, 0x34, 0x56]);
  });

  test('12 34 56', () => {
    const bytes = hexToBytes('12 34 56');
    assert.deepEqual(bytes, [0x12, 0x34, 0x56]);
  });

  test('invalid string', () => {
    assert.throws(() => {
      hexToBytes('asdfghjkl');
    });
  });
});
