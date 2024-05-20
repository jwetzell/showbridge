import assert from 'node:assert';
import { describe, test } from 'node:test';
import HTTPMessage from '../../src/messages/http-message.js';

describe('HTTPMessage', () => {
  test('create', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.notEqual(message, undefined);
    assert.equal(message.messageType, 'http');
  });

  test('IPv6 sender', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '::ffff:127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.sender.address, '127.0.0.1');
  });

  test('X-Forwarded-For sender', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.sender.address, '127.0.0.1');
  });

  test('originalUrl getter', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        headers: {},
        method: 'GET',
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.originalUrl, '/test');
  });

  test('originalUrl setter', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.originalUrl, '/test');
    message.originalUrl = '/changed';
    assert.equal(message.originalUrl, '/changed');
  });

  test('baseUrl getter', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.baseUrl, '/test');
  });

  test('baseUrl setter', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.baseUrl, '/test');
    message.baseUrl = '/changed';
    assert.equal(message.baseUrl, '/changed');
  });

  test('path getter', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.path, '/test');
  });

  test('path setter', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: '',
        path: '/test',
        method: 'GET',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.path, '/test');
    message.path = '/changed';
    assert.equal(message.path, '/changed');
  });

  test('body getter', () => {
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

    assert.equal(message.body, 'body');
  });

  test('body setter', () => {
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

    assert.equal(message.body, 'body');
    message.body = 'changed';
    assert.equal(message.body, 'changed');
  });

  test('method getter', () => {
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

    assert.equal(message.method, 'GET');
  });

  test('method setter', () => {
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

    assert.equal(message.method, 'GET');
    message.method = 'POST';
    assert.equal(message.method, 'POST');
  });

  test('toString', () => {
    const message = new HTTPMessage(
      {
        originalUrl: '/test',
        baseUrl: '/test',
        body: 'body',
        path: '/test',
        headers: {},
        connection: {
          remoteAddress: '127.0.0.1',
        },
      },
      undefined
    );

    assert.equal(message.toString(), '/test');
  });

  test('JSON conversion', () => {
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

    const toJSON = message.toJSON();

    const fromJSON = HTTPMessage.fromJSON(toJSON);

    assert.deepEqual(fromJSON, message);
  });
});
