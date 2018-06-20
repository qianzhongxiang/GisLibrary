import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MultiPanelsModule } from 'projects/cloudy-location/src';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MultiPanelsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
