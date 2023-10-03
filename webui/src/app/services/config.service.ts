import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep, isEqual, orderBy } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { ConfigFile, ConfigState } from '../models/config.models';
import { SchemaService } from './schema.service';
import { SettingsService } from './settings.service';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  configUrl?: URL;

  configStateHistory: ConfigState[] = [];
  pendingConfigIsValid: Boolean = false;

  currentlyShownConfigState: BehaviorSubject<ConfigState | undefined> = new BehaviorSubject<ConfigState | undefined>(
    undefined
  );

  constructor(
    private http: HttpClient,
    private schemaService: SchemaService,
    private settingsService: SettingsService
  ) {
    settingsService.configUrl.subscribe((url) => {
      console.log(`config url: ${url.toString()}`);
      this.configUrl = url;
      this.loadConfig();
    });
  }

  loadConfig() {
    if (this.configUrl) {
      this.http.get<ConfigFile>(this.configUrl.toString()).subscribe((config) => {
        console.log(config);
        const initialConfigState = this.pushConfigState(config, true, true);
        this.currentlyShownConfigState.next(initialConfigState);
      });
    } else {
      throw new Error('config: no config url set');
    }
  }

  uploadConfig(config: ConfigFile) {
    if (this.configUrl) {
      return this.http.post(this.configUrl.toString(), config, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('config: no config url set');
    }
  }

  updateCurrentlyShownConfig(configState: ConfigState) {
    // mark the configStates that match the currently shown as such
    this.configStateHistory.forEach((existingConfigState) => {
      existingConfigState.isCurrent = isEqual(existingConfigState, configState);
    });
    this.currentlyShownConfigState.next(cloneDeep(configState));
  }

  pushConfigState(config: ConfigFile, isLive: boolean = false, isCurrent: boolean = false): ConfigState {
    // TODO(jwetzell): find a way to debounce configState updates
    //mark any configState that has the same config as live as well
    if (isLive) {
      this.configStateHistory.forEach((configState) => {
        configState.isLive = isEqual(configState.config, config);
      });
    }

    //mark any configState that has the same config as current as well
    if (isCurrent) {
      this.configStateHistory.forEach((configState) => {
        configState.isCurrent = isEqual(configState.config, config);
      });
    }

    this.pendingConfigIsValid = this.validate(config);
    const configState = {
      config: cloneDeep(config),
      timestamp: Date.now(),
      isLive,
      isCurrent,
    };
    this.configStateHistory.push(configState);
    this.configStateHistory = orderBy(this.configStateHistory, ['timestamp'], ['desc']);
    return cloneDeep(configState);
  }

  validate(config: ConfigFile) {
    const errors = this.schemaService.validate(config);
    if (errors && errors.length === 0) {
      return true;
    }
    console.error(errors);
    return false;
  }

  setCurrentlyLiveConfigState(configState: ConfigState) {
    this.configStateHistory.forEach((existingConfigState) => {
      existingConfigState.isLive = isEqual(configState.config, existingConfigState.config);
      existingConfigState.isCurrent = isEqual(configState.config, existingConfigState.config);
    });
  }
}
