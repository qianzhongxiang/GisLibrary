import { MapComponent } from './map.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [MapComponent],
  declarations: [MapComponent]
})
export class MapModule { }
