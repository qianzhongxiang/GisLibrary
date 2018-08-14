import { LayerOptions } from './../../../../../dist/cloudy-location/layers/LayerOptions.d';
import ol_source_OSM from 'ol/source/osm';
import ol_layer_Tile from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { LayerGroup } from '../../public_api';
import { ObserverableWMediator } from 'vincijs';
import R_BG_Layer from '../../layers/R_BG_Layer';
import V_Regions_Layer from '../../layers/V_Regions_Layer';
import V_Roads_Layer from '../../layers/V_Roads_Layer';
import V_Distance_Layer from '../../layers/V_Distance_Layer';
import V_Marks_Layer from '../../layers/V_Marks_Layer';

export interface FloorServiceOptions { layerOptions: LayerOptions, floors: LayerGroup[] }

@Injectable({
  providedIn: 'root'
})
export class FloorService extends ObserverableWMediator {
  public Events = { Changed: "Changed" }
  private Options: FloorServiceOptions
  private CurrentFloorNo: number;
  public Floors: LayerGroup[] = []
  /**
   * get current layers of floor, dy default, return first one
   */
  GetLayers(): ol.layer.Layer[] {
    let layerGp = this.CurrentFloorNo ? this.Floors[this.CurrentFloorNo] : this.Floors.find(f => !!f)
    let res: ol.layer.Layer[] = []
    if (layerGp.OMS) res.push(new ol_layer_Tile({ source: new ol_source_OSM() }));
    if (layerGp.bg) res.push(R_BG_Layer(this.Options.layerOptions));
    if (layerGp.regions) res.push(V_Regions_Layer(this.Options.layerOptions));
    if (layerGp.road) res.push(V_Roads_Layer(this.Options.layerOptions));
    if (layerGp.distance) res.push(V_Distance_Layer(this.Options.layerOptions));
    if (layerGp.marks) res.push(V_Marks_Layer(this.Options.layerOptions));
    return res;
  }
  GetFloorNo(): number {
    return this.CurrentFloorNo;
  }
  SetOptions(options: FloorServiceOptions) {
    this.Options = options
    let index = 1;
    this.Floors = [];
    this.Options.floors.forEach(f => {
      if (!f.index) f.index = index;
      index++;
      this.Floors[f.index] = f;
    })
    //该类功能较少 所以不需要 init 方法
    if (this.Options && this.CurrentFloorNo) {
      this.SetFloor(this.CurrentFloorNo)
    }
  }
  SetFloor(number: number) {
    this.CurrentFloorNo = number
    this.SetState(this.Events.Changed, number);
  }
}
