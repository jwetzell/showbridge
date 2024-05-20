import assert from 'node:assert';
import { describe, test } from 'node:test';
import HTTPMessage from '../../src/messages/http-message.js';
import { HTTPRequestTrigger } from '../../src/triggers/index.js';

describe('HTTPRequestTrigger', () => {
  test('create', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test/index.html',
        method: 'get',
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

  test('path match', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test/index.html',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test/index.html',
        baseUrl: '/test',
        body: 'body',
        path: '/test/index.html',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, true);
  });

  test('path mismatch', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test/index.html',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, false);
  });

  test('method match', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        method: 'get',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, true);
  });

  test('method mismatch', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        method: 'get',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'POST',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, false);
  });

  test('path and method match', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test',
        method: 'get',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, true);
  });

  test('path match and method mismatch', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test',
        method: 'get',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'POST',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, false);
  });

  test('path mismatch and method match', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test/index.html',
        method: 'get',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'POST',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, false);
  });

  test('path and method mismatch', () => {
    const trigger = new HTTPRequestTrigger({
      type: 'http-request',
      params: {
        path: '/test/index.html',
        method: 'get',
      },
      actions: [
        {
          type: 'log',
          enabled: true,
        },
      ],
      enabled: true,
    });

    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        method: 'POST',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );
    const fired = trigger.shouldFire(message);
    assert.strictEqual(fired, false);
  });
});
