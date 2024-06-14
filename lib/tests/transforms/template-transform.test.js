/* eslint-disable no-template-curly-in-string */
import assert from 'node:assert';
import { describe, test } from 'node:test';
import TemplateTransform from '../../dist/lib/transforms/template-transform.js';

describe('TemplateTransform', () => {
  test('create', () => {
    const transform = new TemplateTransform({
      type: 'template',
      params: { property: 'test', template: '${msg.data}' },
      enabled: true,
    });
    assert.notEqual(transform, undefined);
  });

  test('complete params', () => {
    const transform = new TemplateTransform({
      type: 'template',
      params: { property: 'test', template: '${msg.data}' },
      enabled: true,
    });
    const msg = { data: 'templated' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 'templated');
  });

  test('missing template', () => {
    const transform = new TemplateTransform({ type: 'template', params: { property: 'test' }, enabled: true });
    const msg = { data: 'templated' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, '');
  });

  test('missing property', () => {
    const transform = new TemplateTransform({ type: 'template', params: { template: '${msg.data}' }, enabled: true });
    const msg = { data: 'templated' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, undefined);
  });

  test('template result is a number', () => {
    const transform = new TemplateTransform({
      type: 'template',
      params: { property: 'test', template: '${msg.data}' },
      enabled: true,
    });
    const msg = { data: '3' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, 3);
  });

  test('template is malformed', () => {
    const transform = new TemplateTransform({
      type: 'template',
      params: { property: 'test', template: '${test.test}' },
      enabled: true,
    });
    const msg = { data: '3' };
    transform.transform(msg, {});
    assert.strictEqual(msg.test, undefined);
  });
});
