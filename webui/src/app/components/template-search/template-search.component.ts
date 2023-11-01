import { Component } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { TemplateObject } from 'src/app/models/template.model';
import { CopyService } from 'src/app/services/copy.service';
import { TemplateService } from 'src/app/services/template.service';
import { TemplateObjects } from 'src/app/utils/templates';

@Component({
  selector: 'app-template-search',
  templateUrl: './template-search.component.html',
  styleUrls: ['./template-search.component.css'],
})
export class TemplateSearchComponent {
  searchResults: TemplateObject[] = [];

  constructor(
    public templateService: TemplateService,
    private copyService: CopyService
  ) {
    this.searchResults = cloneDeep(TemplateObjects);
  }

  updateSearch(event: any) {
    this.searchResults = this.templateService.searchTemplates(event.target.value);
  }

  copyActionTemplate(template: TemplateObject) {
    this.copyService.setCopyObject({
      type: template.type,
      object: template.object,
    });
  }
}
