import { cloneDeep, has, template as lodashTemplate, memoize, set } from 'lodash-es';

const template = memoize(lodashTemplate);

export function getTemplateResult(templateString, data): string {
  const templateFunction = template(templateString);
  return templateFunction(data);
}

export function resolveTemplatedProperty(
  params: { [key: string]: any },
  property: string,
  data: { [key: string]: any }
): number | string | boolean | any[] {
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
          let processedTemplateResult: number | string | boolean = templateResult;
          if (!Number.isNaN(parseFloat(templateResult))) {
            if (templateResult.includes('.')) {
              processedTemplateResult = parseFloat(templateResult);
            } else {
              processedTemplateResult = parseInt(templateResult, 10);
            }
          } else if (templateResult === 'true') {
            processedTemplateResult = true;
          } else if (templateResult === 'false') {
            processedTemplateResult = false;
          }
          processedOutput.push(processedTemplateResult);
        } else {
          processedOutput.push(item);
        }
      });
      return processedOutput;
    }
    if (typeof templatedProperty === 'string') {
      let templateResult = getTemplateResult(templatedProperty, data);
      let processedTemplateResult: number | string | boolean = templateResult;

      if (!Number.isNaN(Number(templateResult))) {
        if (templateResult.includes('.')) {
          processedTemplateResult = parseFloat(templateResult);
        } else {
          processedTemplateResult = parseInt(templateResult, 10);
        }
      } else if (templateResult === 'true') {
        processedTemplateResult = true;
      } else if (templateResult === 'false') {
        processedTemplateResult = false;
      }
      return processedTemplateResult;
    }
    return templatedProperty;
  }
  if (has(params, property)) {
    return params[property];
  }
  return undefined;
}

export function resolveAllKeys(_obj: { [key: string]: any }, data: { [key: string]: any }) {
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
