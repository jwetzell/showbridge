import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONSchemaType } from 'ajv';
import { ConfigFileSchema } from '../models/config.models';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  configUrl: string = '/config';
  configSchemaUrl: string = '/config/schema';
  isDummySite: boolean = false;
  constructor(private http: HttpClient) {}

  setupForDummySite() {
    this.configUrl = '/config.json';
    this.configSchemaUrl = '/config.schema.json';
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

  getSchema() {
    return this.http.get<JSONSchemaType<ConfigFileSchema>>(this.configSchemaUrl);
  }
}
