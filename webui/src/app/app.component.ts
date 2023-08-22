import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { get } from 'lodash';
import { filter } from 'rxjs';
import { ImportConfigComponent } from './components/import-config/import-config.component';
import { ConfigFileSchema } from './models/config.models';
import { ConfigService } from './services/config.service';
import { CopyService } from './services/copy.service';
import { EventService } from './services/event.service';
import { SchemaService } from './services/schema.service';
import { downloadJSON } from './utils/utils';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  config?: ConfigFileSchema;

  shouldRedirect: boolean = false;

  constructor(
    public configService: ConfigService,
    public eventService: EventService,
    public schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private copyService: CopyService
  ) {
    // this.configService.setupForDummySite();
    // this.schemaService.setupForDummySite();
    this.schemaService.loadSchema();
    this.configService.getConfig().subscribe((currentConfig) => {
      this.config = currentConfig;
      this.configService.pushConfigState(currentConfig);
    });

    this.copyService.currentCopyObject.pipe(filter((val) => !!val)).subscribe((object) => {
      console.log(object);
      this.snackBar.open(`${object?.type} copied...`, 'Dismiss', {
        duration: 3000,
      });
    });
  }

  configUpdated() {
    console.log('configUpdated');
    console.log(this.config);
    if (this.config) {
      this.configService.pushConfigState(this.config);
    }
  }

  applyConfig() {
    if (this.configService.isDummySite) {
      this.snackBar.open('Dummy site nothing to save to!', 'Save', {
        duration: 3000,
      });
      return;
    }
    if (this.config) {
      this.configService.uploadConfig(this.config).subscribe((resp) => {
        if (this.config) {
          this.configService.pushConfigState(this.config);
        }

        const newHttpPort = get(this.config, 'http.params.port');

        if (newHttpPort && newHttpPort !== parseInt(location.port)) {
          this.shouldRedirect = true;
        }

        const configAppliedSnackBar = this.snackBar.open('Config saved successfully!', 'Dismiss', {
          duration: 3000,
        });

        configAppliedSnackBar.afterOpened().subscribe((value) => {
          if (!this.shouldRedirect) {
            this.eventService.reload();
          }
        });

        configAppliedSnackBar.afterDismissed().subscribe((value) => {
          if (this.shouldRedirect) {
            this.snackBar
              .open('HTTP port changed redirecting...', 'Redirect', {
                duration: 3000,
              })
              .afterDismissed()
              .subscribe((value) => {
                location.port = `${newHttpPort}`;
              });
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
        this.config = result;
        this.configUpdated();
      });
  }

  downloadConfig() {
    if (this.config) {
      downloadJSON(this.config, 'config.json');
    } else {
      this.snackBar.open('No config to download.', 'Dismiss', {
        duration: 3000,
      });
    }
  }
}
