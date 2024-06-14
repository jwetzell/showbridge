import assert from 'node:assert';
import { describe, test } from 'node:test';
import OSCMessage from '../../dist/lib/messages/osc-message.js';
import { OSCAddressTrigger } from '../../dist/lib/triggers/index.js';

describe('OSCAddressTrigger', () => {
  test('create', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {
        address: '/address',
      },
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

  test('no address configured', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {},
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(
      new OSCMessage({ address: '/address', args: [] }, { address: '127.0.0.1', port: 0 })
    );
    assert.strictEqual(fired, false);
  });

  test('simple address match', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {
        address: '/address',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(
      new OSCMessage({ address: '/address', args: [] }, { address: '127.0.0.1', port: 0 })
    );
    assert.strictEqual(fired, true);
  });

  test('simple address mismatch', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {
        address: '/address',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const fired = trigger.shouldFire(
      new OSCMessage({ address: '/something/else', args: [] }, { address: '127.0.0.1', port: 0 })
    );
    assert.strictEqual(fired, false);
  });

  test('* wildcard', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {
        address: '/address/*',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodAddresses = ['/address/one', '/address/two'];
    const badAddresses = ['/address/and/then/some', '/address'];

    goodAddresses.forEach((address) => {
      const fired = trigger.shouldFire(new OSCMessage({ address, args: [] }, { address: '127.0.0.1', port: 0 }));
      assert.strictEqual(fired, true);
    });

    badAddresses.forEach((address) => {
      const fired = trigger.shouldFire(new OSCMessage({ address, args: [] }, { address: '127.0.0.1', port: 0 }));
      assert.strictEqual(fired, false);
    });
  });

  test('? wildcard', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {
        address: '/address/?',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodAddresses = ['/address/a', '/address/b'];
    const badAddresses = ['/address/ab', '/address/cd'];

    goodAddresses.forEach((address) => {
      const fired = trigger.shouldFire(new OSCMessage({ address, args: [] }, { address: '127.0.0.1', port: 0 }));
      assert.strictEqual(fired, true);
    });

    badAddresses.forEach((address) => {
      const fired = trigger.shouldFire(new OSCMessage({ address, args: [] }, { address: '127.0.0.1', port: 0 }));
      assert.strictEqual(fired, false);
    });
  });

  test('{} wildcard', () => {
    const trigger = new OSCAddressTrigger({
      type: 'osc-address',
      params: {
        address: '/address/{one,two}',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const goodAddresses = ['/address/one', '/address/two'];
    const badAddresses = ['/address/three', '/address/four'];

    goodAddresses.forEach((address) => {
      const fired = trigger.shouldFire(new OSCMessage({ address, args: [] }, { address: '127.0.0.1', port: 0 }));
      assert.strictEqual(fired, true);
    });

    badAddresses.forEach((address) => {
      const fired = trigger.shouldFire(new OSCMessage({ address, args: [] }, { address: '127.0.0.1', port: 0 }));
      assert.strictEqual(fired, false);
    });
  });

  // TODO(jwetzell): add combined wildcard tests
});
