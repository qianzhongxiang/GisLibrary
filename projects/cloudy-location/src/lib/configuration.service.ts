import { MapConifg } from './../utilities/config';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }
  private mapConfig: MapConifg = {
    geoServerUrl: "http://localhost:8080/geoserver",
    trackOfComponent: false,
    layers: { OMS: true, bg: true },
    centerPoint: [0, 0],
    centerSrs: "EPSG:4326",
    srs: "EPSG:4326",
    geoServerGroup: "LS",
    frontEndEpsg: "EPSG:3857",
    GWC: true,
    floorSwitcher: true
  }
  public get MapConfig(): MapConifg {
    return this.mapConfig;
  }
  public set MapConfig(config: MapConifg) {
    Object.assign(this.mapConfig, config);
  }
}
