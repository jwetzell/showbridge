import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
}
