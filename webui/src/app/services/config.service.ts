import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONSchemaType } from 'ajv';
import { ConfigFileSchema } from '../models/config.models';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http: HttpClient) {}

  uploadConfig(config: ConfigFileSchema) {
    console.log('upload config');
    console.log(JSON.stringify(config));
    return this.http.post(`/config`, config, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getConfig() {
    return this.http.get<ConfigFileSchema>(`/config`);
  }

  getSchema() {
    return this.http.get<JSONSchemaType<ConfigFileSchema>>(`/config/schema`);
  }
}
