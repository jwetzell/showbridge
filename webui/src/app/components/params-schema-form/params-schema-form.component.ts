import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-params-schema-form',
  templateUrl: './params-schema-form.component.html',
  styleUrls: ['./params-schema-form.component.css'],
})
export class ParamsSchemaFormComponent implements OnInit {
  @Input() objectType?: string;
  @Input() type?: string;

  paramsSchema: any;

  paramsFormGroup: FormGroup = new FormGroup({});

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.objectType && this.type) {
      this.paramsSchema = this.schemaService.getParamsForObjectType(this.objectType, this.type);
      if (this.paramsSchema?.properties) {
        console.log(this.paramsSchema.properties);
        Object.entries(this.paramsSchema.properties).forEach(([paramKey, paramSchema]) => {
          this.paramsFormGroup.addControl(paramKey, new FormControl(''));
        });
      }
    }
  }

  paramKeys() {
    return Object.keys(this.paramsFormGroup.controls);
  }
}
