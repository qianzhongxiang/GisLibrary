import { MapConifg, AssetConfig, DataMapping } from './../utilities/config';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }
  /**
   * 目前未实现
   */
  private dataMapping: DataMapping = {
    X: "X",
    Y: "Y",
    Z: "Z",
    EPSG: "EPSG",
    Type: "Type",
    CollectTime: "CollectTime",
    Name: "Name",
    UniqueId: "UniqueId",
    Duration: "Duration",
    Offline: "Offline",
    Direction: "Direction",
    CustomInterval: "CustomInterval",
    Region: "Region",
    Floor: "Floor"
  }
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
  private assetConfig: AssetConfig = {
    assetProfileUrl: "/assets/local-assets.json",
    sort: true
  }
  public get MapConfig(): MapConifg {
    return this.mapConfig;
  }
  public set MapConfig(config: MapConifg) {
    Object.assign(this.mapConfig, config);
  }

  public get AssetConfig(): AssetConfig {
    return this.assetConfig;
  }
  public set AssetConfig(config: AssetConfig) {
    Object.assign(this.assetConfig, config)
  }
}
