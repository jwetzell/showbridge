import { cloneDeep, has, template as lodashTemplate, memoize, set } from 'lodash-es';

const template = memoize(lodashTemplate);

/**
 *
 * @param {string} templateString
 * @param {object} data
 * @returns {string}
 */
export function getTemplateResult(templateString, data) {
  const templateFunction = template(templateString);
  return templateFunction(data);
}

export function resolveTemplatedProperty(params, property, data) {
  if (has(params, `_${property}`)) {
    // NOTE(jwetzell): if we have a template version of the property
    const templatedProperty = params[`_${property}`];

    // NOTE(jwetzell): process arrays items one by one
    if (Array.isArray(templatedProperty)) {
      const processedOutput = [];
      templatedProperty.forEach((item) => {
        // NOTE(jwetzell): only template string types
        if (typeof item === 'string') {
          let templateResult = getTemplateResult(item, data);
          if (!Number.isNaN(templateResult * 1)) {
            if (templateResult.includes('.')) {
              templateResult = parseFloat(templateResult);
            } else {
              templateResult = parseInt(templateResult, 10);
            }
          } else if (templateResult === 'true') {
            templateResult = true;
          } else if (templateResult === 'false') {
            templateResult = false;
          }
          processedOutput.push(templateResult);
        } else {
          processedOutput.push(item);
        }
      });
      return processedOutput;
    }
    if (typeof templatedProperty === 'string') {
      let templateResult = getTemplateResult(templatedProperty, data);
      if (!Number.isNaN(templateResult * 1)) {
        if (templateResult.includes('.')) {
          templateResult = parseFloat(templateResult);
        } else {
          templateResult = parseInt(templateResult, 10);
        }
      } else if (templateResult === 'true') {
        templateResult = true;
      } else if (templateResult === 'false') {
        templateResult = false;
      }
      return templateResult;
    }
    return templatedProperty;
  }
  if (has(params, property)) {
    return params[property];
  }
  return undefined;
}

export function resolveAllKeys(_obj, data) {
  const obj = cloneDeep(_obj);
  Object.keys(obj)
    .filter((key) => key.startsWith('_'))
    .forEach((templateKey) => {
      // NOTE(jwetzell): essentially replace _key: "${msg.property}" with key: "resolvedValue"
      const cleanKey = templateKey.replace('_', '');
      set(obj, cleanKey, resolveTemplatedProperty(obj, cleanKey, data));
      delete obj[templateKey];
    });
  return obj;
}
