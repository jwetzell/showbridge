import { Injectable } from '@angular/core';
import { get } from 'lodash-es';
import MiniSearch from 'minisearch';
import { TemplateObject } from '../models/template.model';
import { TemplateObjects } from '../utils/templates';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  public templateSearch: MiniSearch = new MiniSearch({
    fields: ['object.comment', 'object.type', 'tags'],
    extractField: (document, fieldName) => {
      return get(document, fieldName, '');
    },
    searchOptions: {
      fuzzy: true,
    },
  });

  constructor() {
    const templatesWithId = TemplateObjects.map((template, index) => {
      template.id = index;
      return template;
    });
    this.templateSearch.addAll(templatesWithId);
  }

  searchTemplates(query: string): TemplateObject[] {
    if (query == '') {
      return TemplateObjects;
    }
    const templates = this.templateSearch
      .search(query, {
        fuzzy: 0.2,
        prefix: true,
      })
      .map((searchResult) => TemplateObjects.find((template) => template.id === searchResult.id));
    return templates.filter(this.isDefined<TemplateObject>);
  }

  isDefined<T>(argument: T | undefined): argument is T {
    return argument !== undefined;
  }
}
