import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ActionComponent } from './components/action/action.component';
import { ConfigComponent } from './components/config/config.component';
import { ProtocolViewComponent } from './components/protocol-view/protocol-view.component';
import { TransformComponent } from './components/transform/transform.component';
import { TriggerComponent } from './components/trigger/trigger.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    TransformComponent,
    ActionComponent,
    TriggerComponent,
    ProtocolViewComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatTreeModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
