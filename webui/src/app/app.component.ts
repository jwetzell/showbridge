import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { get } from 'lodash';
import { filter } from 'rxjs';
import { ImportConfigComponent } from './components/import-config/import-config.component';
import { ConfigState } from './models/config.models';
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
  currentlyShownConfigState?: ConfigState;

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
    this.configService.currentlyShownConfigState.subscribe((currentConfig) => {
      if (currentConfig) {
        this.currentlyShownConfigState = currentConfig;
      }
    });

    this.copyService.currentCopyObject.pipe(filter((val) => !!val)).subscribe((object) => {
      this.snackBar.open(`${object?.type} copied...`, 'Dismiss', {
        duration: 3000,
      });
    });
  }

  configUpdated() {
    console.log('configUpdated');
    console.log(this.currentlyShownConfigState);
    if (this.currentlyShownConfigState?.config) {
      this.configService.pushConfigState(this.currentlyShownConfigState.config, false, true);
    }
  }

  applyConfig() {
    if (this.configService.isDummySite) {
      this.snackBar.open('Dummy site nothing to save to!', 'Save', {
        duration: 3000,
      });
      return;
    }
    if (this.currentlyShownConfigState) {
      this.configService.uploadConfig(this.currentlyShownConfigState.config).subscribe((resp) => {
        if (this.currentlyShownConfigState) {
          this.configService.setCurrentlyLiveConfigState(this.currentlyShownConfigState);

          const newHttpPort = get(this.currentlyShownConfigState.config, 'http.params.port');

          if (newHttpPort && newHttpPort !== parseInt(location.port)) {
            this.shouldRedirect = true;
          }

          const configAppliedSnackBar = this.snackBar.open('Config applied successfully!', 'Dismiss', {
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
        }
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
        if (this.currentlyShownConfigState) {
          this.currentlyShownConfigState.config = result;
        }
        this.configUpdated();
      });
  }

  downloadConfig() {
    if (this.currentlyShownConfigState?.config) {
      downloadJSON(this.currentlyShownConfigState?.config, 'config.json');
    } else {
      this.snackBar.open('No config to download.', 'Dismiss', {
        duration: 3000,
      });
    }
  }

  loadConfigState(configState: ConfigState) {
    this.configService.updateCurrentlyShownConfig(configState);
  }
}
