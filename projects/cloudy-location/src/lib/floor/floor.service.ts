import { LayerGroup } from './../../utilities/config';
import ol_source_OSM from 'ol/source/osm';
import ol_layer_Tile from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { ObserverableWMediator } from 'vincijs';
import R_BG_Layer from '../../layers/R_BG_Layer';
import V_Regions_Layer from '../../layers/V_Regions_Layer';
import V_Roads_Layer from '../../layers/V_Roads_Layer';
import V_Distance_Layer from '../../layers/V_Distance_Layer';
import V_Marks_Layer from '../../layers/V_Marks_Layer';
import { LayerOptions } from '../../layers/Layers';

export interface FloorServiceOptions { layerOptions: LayerOptions, floors: LayerGroup[] }

@Injectable({
  providedIn: 'root'
})
export class FloorService extends ObserverableWMediator {
  public Events = { Changed: "Changed" }
  private Options: FloorServiceOptions
  private CurrentFloorNo: number;
  /**
   * layers disclude layers of layerGroup
   */
  private Layers: ol.layer.Layer[][] = []
  private Layers4PerFloor: ol.layer.Layer[] = []
  public Floors: LayerGroup[] = []
  /**
   * get current layers of floor, dy default, return first one
   */
  GetLayers(): ol.layer.Layer[] {
    let layerGp = this.GetFloor();
    let res: ol.layer.Layer[] = []
    if (layerGp.OMS) res.push(new ol_layer_Tile({ source: new ol_source_OSM() }));
    if (layerGp.bg) res.push(R_BG_Layer(this.Options.layerOptions));
    if (layerGp.regions) res.push(V_Regions_Layer(this.Options.layerOptions));
    if (layerGp.road) res.push(V_Roads_Layer(this.Options.layerOptions));
    if (layerGp.distance) res.push(V_Distance_Layer(this.Options.layerOptions));
    if (layerGp.marks) res.push(V_Marks_Layer(this.Options.layerOptions));
    return [...res, ...(this.Layers[this.GetFloorNo()] || []), ...this.Layers4PerFloor];
  }
  /**
   * add layers, 为每一楼层添加指定图层，便于在切换楼层之后回复之前添加过的图层
   * @param layers 
   * @param floorNo will add layers for every floor if floorNo===false
   */
  AddLayers(layers: ol.layer.Layer[], floorNo?: number | boolean) {
    if (!layers) return;
    if (typeof floorNo === "boolean") {
      if (floorNo === false)
        this.Layers4PerFloor = this.Layers4PerFloor.concat(layers)
    } else {
      let no = floorNo || this.GetFloorNo()
      this.Layers[no] = [...(this.Layers[no] || []), ...layers]
    }
  }
  /**
   *  clear all layers of floor but layers of group, 清理指定楼层上所有图层，默认为当前楼层
   * @param floorNo 
   */
  ClearLayers(floorNo?: number) {
    this.Layers[floorNo || this.GetFloorNo()] = []
  }

  GetFloorNo(): number {
    return this.CurrentFloorNo || 1;
  }
  GetFloor(floorNo?: number): LayerGroup {
    floorNo = floorNo || this.GetFloorNo();
    return this.Floors.find(f => f.index == floorNo)
  }
  SetOptions(options: FloorServiceOptions) {
    this.Options = options
    let index = 1;
    this.Floors = [];
    this.Options.floors.forEach(f => {
      if (!f.index) f.index = index;
      index++;
      this.Floors.push(f);
    })
    //sort
    this.Floors.sort((a, b) => {
      if (a.index > b.index) return 1;
      else return -1;
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
