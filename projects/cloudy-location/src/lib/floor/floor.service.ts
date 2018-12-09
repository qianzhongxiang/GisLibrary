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
import OlGroup from 'ol/layer/group';
import { LayerOptions } from '../../layers/Layers';

export interface FloorServiceOptions { layerOptions: LayerOptions; floors: LayerGroup[]; }

@Injectable({
  providedIn: 'root'
})
export class FloorService extends ObserverableWMediator {
  public Events = { Changed: 'Changed' };
  private Options: FloorServiceOptions;
  private CurrentFloorNo: number;
  /**
   * layers disclude layers of layerGroup
   */
  private Layers: ol.layer.Layer[][] = [];
  private Layers4PerFloor: ol.layer.Layer[] = [];
  public Floors: LayerGroup[] = [];
  /**
   * get current layers of floor, dy default, return first one
   */
  GetLayers(): (ol.layer.Layer | ol.layer.Group)[] {
    const layerGp = this.GetFloor();
    const res: ol.layer.Group = new OlGroup({ title: '基础' } as any);
    if (layerGp.OMS) {
      res.getLayers().push(
        new ol_layer_Tile({ title: '全球街道图', source: new ol_source_OSM() } as any)

        // new OlGroup({
        //   title: '全球街道', layers: [
        //     new ol_layer_Tile({ source: new ol_source_OSM() })
        //   ]
        // } as any)
      );
    }
    if (layerGp.bg) {
      res.getLayers().push(
        R_BG_Layer(Object.assign({}, this.Options.layerOptions
          , typeof layerGp.bg === 'object' ? layerGp.bg : {}))
        // new OlGroup({
        //   title: '实景图', layers: [
        //     R_BG_Layer(Object.assign({}, this.Options.layerOptions
        //       , typeof layerGp.bg === 'object' ? layerGp.bg : {}))
        //   ]
        // } as any)
      );
    }
    if (layerGp.regions) {
      res.getLayers().push(
        V_Regions_Layer(Object.assign({}, this.Options.layerOptions
          , typeof layerGp.regions === 'object' ? layerGp.regions : {}))
        // new OlGroup({
        //   title: '区域图', layers: [
        //     V_Regions_Layer(Object.assign({}, this.Options.layerOptions
        //       , typeof layerGp.regions === 'object' ? layerGp.regions : {}))
        //   ]
        // } as any)
      );
    }
    if (layerGp.road) {
      res.getLayers().push(
        V_Roads_Layer(Object.assign({}, this.Options.layerOptions
          , typeof layerGp.road === 'object' ? layerGp.road : {}))
        // new OlGroup({
        //   title: '道路', layers: [
        //     V_Roads_Layer(Object.assign({}, this.Options.layerOptions
        //       , typeof layerGp.road === 'object' ? layerGp.road : {}))
        //   ]
        // } as any)
      );
    }
    if (layerGp.distance) {
      res.getLayers().push(
        V_Distance_Layer(this.Options.layerOptions)

        // new OlGroup({
        //   title: '距离标识', layers: [
        //     V_Distance_Layer(this.Options.layerOptions)
        //   ]
        // } as any)
      );
    }
    if (layerGp.marks) {
      res.getLayers().push(
        V_Marks_Layer(this.Options.layerOptions)
        // new OlGroup({
        //   title: '标记', layers: [
        //     V_Marks_Layer(this.Options.layerOptions)
        //   ]
        // } as any)
      );
    }
    return [res, ...(this.Layers[this.GetFloorNo()] || []), ...this.Layers4PerFloor];
  }
  /**
   * add layers, 为每一楼层添加指定图层，便于在切换楼层之后回复之前添加过的图层
   * @param layers 
   * @param floorNo will add layers for every floor if floorNo===false
   */
  AddLayers(layers: ol.layer.Layer[], floorNo?: number | boolean) {
    if (!layers) { return; }
    if (typeof floorNo === "boolean") {
      if (floorNo === false) {
        this.Layers4PerFloor = this.Layers4PerFloor.concat(layers);
      }
    } else {
      let no = floorNo || this.GetFloorNo();
      this.Layers[no] = [...(this.Layers[no] || []), ...layers];
    }
  }
  /**
   *  clear all layers of floor but layers of group, 清理指定楼层上所有图层，默认为当前楼层
   * @param floorNo 
   */
  ClearLayers(floorNo?: number) {
    this.Layers[floorNo || this.GetFloorNo()] = [];
  }

  GetFloorNo(): number {
    return this.CurrentFloorNo || 1;
  }
  GetFloor(floorNo?: number): LayerGroup {
    floorNo = floorNo || this.GetFloorNo();
    return this.Floors.find(f => f.index == floorNo);
  }
  SetOptions(options: FloorServiceOptions) {
    this.Options = options;
    let index = 1;
    this.Floors = [];
    this.Options.floors.forEach(f => {
      if (!f.index) { f.index = index; }
      index++;
      this.Floors.push(f);
    });
    //sort
    this.Floors.sort((a, b) => {
      if (a.index > b.index) { return 1; }
      else { return -1; }
    });

    //该类功能较少 所以不需要 init 方法
    if (this.Options && this.CurrentFloorNo) {
      this.SetFloor(this.CurrentFloorNo);
    }
  }
  SetFloor(number: number) {
    this.CurrentFloorNo = number;
    this.SetState(this.Events.Changed, number);
  }
}
