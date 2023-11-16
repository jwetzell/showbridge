import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { cloneDeep, has } from 'lodash-es';
import { Subscription } from 'rxjs';
import { ParamInfo, ParamsFormInfo } from 'src/app/models/form.model';
import { MIDIPatch, NetworkPatch } from 'src/app/models/patches.model';
import { SchemaService } from 'src/app/services/schema.service';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'app-params-form',
  templateUrl: './params-form.component.html',
  styleUrls: ['./params-form.component.css'],
})
export class ParamsFormComponent implements OnInit {
  @Input() parentSchema?: SomeJSONSchema;
  @Input() data?: any;
  @Input() patchable: boolean = false;
  @Output() updated: EventEmitter<any> = new EventEmitter<any>();

  paramsSchema?: SomeJSONSchema;
  paramsFormInfo?: ParamsFormInfo;

  formGroupSubscription?: Subscription;
  paramsOptions: { display: string; paramsFormInfo: ParamsFormInfo; keys: string[]; schema: SomeJSONSchema }[] = [];
  paramsOptionsSelectedIndex: number = 0;

  keysToTemplate: Set<string> = new Set<string>();

  patchType: 'midi' | 'network' | undefined;
  patchIndex: number = -1;

  midiPatches?: MIDIPatch[];
  networkPatches?: NetworkPatch[];

  constructor(
    private schemaService: SchemaService,
    private varsService: VarsService
  ) {
    this.varsService.currentVars.subscribe((vars) => {
      (this.midiPatches = vars.patches.midi), (this.networkPatches = vars.patches.network);
    });
  }

  ngOnInit(): void {
    this.paramsSchema = this.parentSchema?.properties?.params;
    if (this.paramsSchema) {
      if (this.paramsSchema.properties) {
        this.paramsFormInfo = this.schemaService.getFormInfoFromParamsSchema(this.paramsSchema);
      } else if (this.paramsSchema.oneOf) {
        this.paramsOptions = this.paramsSchema.oneOf.map((oneOf: any) => {
          const paramsOption = {
            display: oneOf.title,
            schema: oneOf,
            paramsFormInfo: this.schemaService.getFormInfoFromParamsSchema(oneOf),
          };
          return {
            ...paramsOption,
            keys: Object.keys(paramsOption.paramsFormInfo.formGroup.controls),
          };
        });
        const matchingSchemaIndex = this.schemaService.matchParamsDataToSchema(
          this.data,
          this.paramsOptions.map((paramsOption) => paramsOption.schema)
        );

        this.paramsOptionsSelectedIndex = matchingSchemaIndex;
        this.paramsFormInfo = this.paramsOptions[matchingSchemaIndex].paramsFormInfo;
        this.paramsSchema = this.paramsOptions[matchingSchemaIndex].schema;
      } else {
        console.error('params is not a singular or oneOf');
        console.error(this.parentSchema);
      }
    }

    if (this.data && this.paramsFormInfo?.formGroup) {
      // NOTE(jwetzell): prepare data for form patching
      const dataToPatch = cloneDeep(this.data);
      Object.entries(this.paramsFormInfo.paramsInfo).forEach(([paramKey, paramInfo]) => {
        if (has(dataToPatch, paramKey)) {
          switch (paramInfo.type) {
            case 'object':
              dataToPatch[paramKey] = JSON.stringify(dataToPatch[paramKey]);
              break;
            case 'array':
              dataToPatch[paramKey] = dataToPatch[paramKey]
                .map((item: any) => {
                  switch (typeof item) {
                    case 'object':
                      return JSON.stringify(item);

                    default:
                      return item;
                  }
                })
                .join(',');
              break;
            default:
              break;
          }
          if (paramKey === '_port' || paramKey === '_host') {
            //NOTE(jwetzell): determine what patch to load for dropdown
            const valueIsPatch = dataToPatch[paramKey].match(/^\${vars.patches.(midi|network)\[(\d+)\].(port|host)}$/);
            if (valueIsPatch) {
              this.patchType = valueIsPatch[1];
              try {
                this.patchIndex = parseInt(valueIsPatch[2]);
              } catch (error) {
                console.error('params-form: error decoding patch info');
              }
            }
          }
        }
      });

      //NOTE(jwetzell): initialize keysToTemplate
      Object.entries(dataToPatch).forEach(([key, value]) => {
        if (key.startsWith('_') && value !== undefined) {
          this.keysToTemplate.add(key.substring(1));
        }
      });

      if (has(this.paramsFormInfo.paramsInfo, 'port')) {
        if (has(this.paramsFormInfo.paramsInfo, 'host')) {
          this.patchType = 'network';
        } else {
          this.patchType = 'midi';
        }
      }

      this.paramsFormInfo.formGroup.patchValue(dataToPatch);
    }

    this.formGroupSubscription = this.paramsFormInfo?.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  paramsOptionsTabSelected(event: MatTabChangeEvent) {
    // NOTE(jwetzell): no longer interested in the old formGroup valueChanges
    if (this.formGroupSubscription) {
      this.formGroupSubscription.unsubscribe();
    }

    const paramsOption = this.paramsOptions[event.index];

    this.paramsSchema = paramsOption.schema;
    this.paramsFormInfo = paramsOption.paramsFormInfo;

    // NOTE(jwetzell): prune params that MUST change from the data when switch paramOptions
    Object.entries(this.paramsFormInfo.paramsInfo).forEach(([paramKey, paramInfo]) => {
      if (paramInfo.isConst && this.data) {
        if (this.data[paramKey]) {
          delete this.data[paramKey];
        }
      }
    });

    const allowedParamKeys = Object.keys(this.paramsSchema?.properties);
    if (this.data) {
      // NOTE(jwetzell): remove keys that aren't allowed in the new params variation
      Object.keys(this.data).forEach((paramKey) => {
        if (allowedParamKeys && !allowedParamKeys.includes(paramKey)) {
          delete this.data[paramKey];
        }
      });
    }

    if (this.paramsFormInfo.formGroup) {
      this.formGroupSubscription = this.paramsFormInfo.formGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }

    if (this.data && this.paramsFormInfo.formGroup) {
      this.paramsFormInfo.formGroup.patchValue(this.data);
    }
  }

  formUpdated() {
    if (this.paramsSchema) {
      const params = this.schemaService.cleanParams(
        this.paramsSchema,
        this.paramsFormInfo?.formGroup.value,
        this.keysToTemplate
      );
      this.updated.emit(params);
    } else {
      console.error('params-form: no paramsSchema loaded');
    }
  }

  paramKeys() {
    if (this.paramsFormInfo) {
      return Object.keys(this.paramsFormInfo?.formGroup.controls).filter((key) => {
        if (this.keysToTemplate.has(key)) {
          return false;
        }

        // NOTE(jwezell): exclude template keys that aren't supposed to be
        if (key.startsWith('_') && !this.keysToTemplate.has(key.substring(1))) {
          return false;
        }
        return true;
      });
    }
    return [];
  }

  getParamInfo(key: string): ParamInfo | undefined {
    return this.paramsFormInfo?.paramsInfo[key];
  }

  toggleTemplate(key: string) {
    if (this.paramsFormInfo?.formGroup.value[key] !== undefined) {
      const value = this.paramsFormInfo.formGroup.value[key];
      if (key.startsWith('_')) {
        this.paramsFormInfo.formGroup.controls[`${key.substring(1)}`].setValue(value);
      } else {
        this.paramsFormInfo.formGroup.controls[`_${key}`].setValue(value);
      }
    }
    if (key.startsWith('_')) {
      key = key.substring(1);
    }
    if (this.keysToTemplate.has(key)) {
      this.keysToTemplate.delete(key);
    } else {
      this.keysToTemplate.add(key);
    }

    this.formUpdated();
  }

  baseKeyIsTemplated(key: string): boolean {
    if (key.startsWith('_')) {
      return this.keysToTemplate.has(key.substring(1));
    }
    return this.keysToTemplate.has(key);
  }

  applyPatch(event: Event) {
    const patchIndex = (event.target as HTMLInputElement).value;

    if (this.patchType !== undefined && patchIndex !== '-1') {
      if (this.patchType === 'network') {
        this.keysToTemplate.add('port');
        this.keysToTemplate.add('host');
        this.paramsFormInfo?.formGroup.controls['_port']?.setValue(
          '${vars.patches.' + this.patchType + '[' + patchIndex + '].port}'
        );
        this.paramsFormInfo?.formGroup.controls['_host']?.setValue(
          '${vars.patches.' + this.patchType + '[' + patchIndex + '].host}'
        );
      } else if (this.patchType === 'midi') {
        this.keysToTemplate.add('port');
        this.paramsFormInfo?.formGroup.controls['_port'].setValue(
          '${vars.patches.' + this.patchType + '[' + patchIndex + '].port}'
        );
      }
    } else {
      if (this.patchType === 'network') {
        this.keysToTemplate.delete('port');
        this.keysToTemplate.delete('host');
        this.paramsFormInfo?.formGroup.controls['_port']?.reset();
        this.paramsFormInfo?.formGroup.controls['_host']?.reset();
      } else if (this.patchType === 'midi') {
        this.keysToTemplate.delete('port');
        this.paramsFormInfo?.formGroup.controls['_port'].reset();
      }
    }
    this.formUpdated();
  }
}
