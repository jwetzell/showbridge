import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, filter } from 'rxjs';
import { ImportConfigComponent } from './components/import-config/import-config.component';
import { ConfigFileSchema } from './models/config.models';
import { ConfigService } from './services/config.service';
import { EventService } from './services/event.service';
import { SchemaService } from './services/schema.service';
import { downloadJSON } from './utils/utils';
import { get } from 'lodash';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  config$: Subject<ConfigFileSchema> = new Subject<ConfigFileSchema>();

  pendingConfig?: ConfigFileSchema;
  pendingConfigIsValid: Boolean = false;
  schemaLoaded: Boolean = false;
  config?: ConfigFileSchema;

  constructor(
    private configService: ConfigService,
    public eventService: EventService,
    private schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // this.configService.setupForDummySite();
    this.configService.getConfig().subscribe((currentConfig) => {
      this.config$.next(currentConfig);
      this.config = currentConfig;
    });
    this.configService.getSchema().subscribe((schema) => {
      this.schemaService.setSchema(schema);
      this.schemaLoaded = true;
    });
  }

  configUpdated(newConfig: ConfigFileSchema) {
    this.pendingConfig = newConfig;
    this.pendingConfigIsValid = this.validatePendingConfig();
    if (!this.pendingConfigIsValid) {
      console.error(this.schemaService.ajv?.errors);
    }
  }

  applyConfig() {
    if (this.configService.isDummySite) {
      this.snackBar.open('Dummy site nothing to save to!', 'Save', {
        duration: 3000,
      });
      return;
    }
    if (this.pendingConfig) {
      this.configService.uploadConfig(this.pendingConfig).subscribe((resp) => {
        this.config = this.pendingConfig;
        this.pendingConfig = undefined;
        this.pendingConfigIsValid = false;

        const newHttpPort = get(this.config, 'http.params.port');

        this.snackBar
          .open('Config saved successfully!', 'Dismiss', {
            duration: 3000,
          })
          .afterDismissed()
          .subscribe((value) => {
            if (newHttpPort && newHttpPort !== parseInt(location.port)) {
              this.snackBar
                .open('HTTP port changed redirecting...', 'Redirect', {
                  duration: 3000,
                })
                .afterDismissed()
                .subscribe((value) => {
                  location.port = `${newHttpPort}`;
                });
            } else {
              this.eventService.reload();
            }
          });
      });
    } else {
      console.error('pending config is null');
    }
  }

  importConfig() {
    const dialogRef = this.dialog.open(ImportConfigComponent, {
      width: '400px',
      height: '400px',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result) => !!result && result !== ''))
      .subscribe((result) => {
        this.config$.next(result);
        this.config = result;
        this.configUpdated(result);
      });
  }

  downloadConfig() {
    const configToDownload = this.pendingConfig ? this.pendingConfig : this.config;
    downloadJSON(configToDownload, 'config.json');
  }

  validatePendingConfig() {
    if (this.schemaService.ajv) {
      const valid = this.schemaService.ajv.validate('Config', this.pendingConfig);
      return valid;
    }
    return false;
  }
}
