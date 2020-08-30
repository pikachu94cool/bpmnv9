import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DiagramComponent } from './diagram/diagram.component';
import { HttpClientModule } from '@angular/common/http';
import { OverlayComponent } from './overlay/overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
    OverlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: Window, useValue: window }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
