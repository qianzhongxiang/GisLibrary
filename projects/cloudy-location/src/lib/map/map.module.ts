import { ConfigurationService } from './../configuration.service';
import { AssetService } from './../asset-service/asset.service';
import { FloorComponent } from './../floor/floor.component';
import { FloorService } from './../floor/floor.service';
import { DeviceService } from './../device-service/device.service';
import { OlMapService } from './../map-service/ol-map.service';
import { MapComponent } from './map.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [MapComponent],
  declarations: [MapComponent, FloorComponent],
  providers: [
    OlMapService,
    DeviceService,
    FloorService,
    AssetService,
    ConfigurationService
  ]
})
export class MapModule { }
