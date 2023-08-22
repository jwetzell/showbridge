import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ConfigFileSchema } from '../models/config.models';
import { SchemaService } from './schema.service';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  configUrl: string = '/config';
  configSchemaUrl: string = '/config/schema';
  isDummySite: boolean = false;

  configChangeHistory: ConfigFileSchema[] = [];
  pendingConfigIsValid: Boolean = false;

  constructor(
    private http: HttpClient,
    private schemaService: SchemaService
  ) {}

  setupForDummySite() {
    this.configUrl = '/config.json';
    this.isDummySite = true;
  }

  uploadConfig(config: ConfigFileSchema) {
    return this.http.post(this.configUrl, config, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getConfig() {
    return this.http.get<ConfigFileSchema>(this.configUrl);
  }

  pushConfigState(config: ConfigFileSchema) {
    this.pendingConfigIsValid = this.validate(config);
    this.configChangeHistory.push(cloneDeep(config));
  }

  validate(config: ConfigFileSchema) {
    const errors = this.schemaService.validate(config);
    if (errors && errors.length === 0) {
      return true;
    }
    console.error(errors);
    return false;
  }
}
