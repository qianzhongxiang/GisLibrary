import { MapConifg } from './../../utilities/config';
import { LogHelper, Ajax } from 'vincijs';
import { Injectable } from '@angular/core';
import { ContextMenu_Super } from './../../utilities/ContextMenu_Super';
import olFormatGeoJson from 'ol/format/GeoJson';
import ol_Map from 'ol/map';
import ol_style from 'ol/style/Style';
import ol_stroke from 'ol/style/Stroke';
import ol_layer_Tile from 'ol/layer/tile';
import ol_source_OSM from 'ol/source/osm';
import ol_layer_vector from 'ol/layer/Vector';
import ol_source_vector from 'ol/source/Vector';
import ol_View from 'ol/view';
import ol_proj from 'ol/proj';
import ol_feature from 'ol/feature';
import ol_polygon from 'ol/geom/Polygon';
import ol_lineString from 'ol/geom/LineString';
import ol_geometry from 'ol/geom/Geometry';
import ol_draw from 'ol/interaction/Draw'
import ol_select from 'ol/interaction/Select';
import R_BG_Layer from "./../../layers/R_BG_Layer";
import V_Roads_Layer from "./../../layers/V_Roads_Layer";
import V_Distance_Layer from "./../../layers/V_Distance_Layer";
import V_Marks_Layer from "./../../layers/V_Marks_Layer";
import ol_PostionControl from 'ol/control/mouseposition';
import ol_box_selection from 'ol/interaction/DragBox'
import ol_events_condition from 'ol/events/condition'
import olpopup from 'ol-popup'
@Injectable()
export class OlMapService {
  private RouteL: ol.layer.Vector
  private RangeL: ol.layer.Vector
  private DrawL: ol.layer.Vector
  private Config: MapConifg
  /**
   * 获取矢量图层
   * @param type "route|range|draw"
   */
  public GetVectorLayer(type: string): ol.layer.Vector {
    switch (type) {
      case "route":
        return this.RouteL;
      case "range":
        return this.RangeL;
      case "draw":
        return this.DrawL;
    }
  }
  constructor() { }

  private Map: ol.Map
  private CurrentPointByMouse: [number, number]
  public Init(Config: MapConifg) {
    this.Config = Config;
  }
  public Show(data: { target: HTMLElement }) {
    this.EnvironmentConfig(data.target);
  }
  /**
   * AddLayer
   * @param layer
   */
  public AddLayer(layer: ol.layer.Layer) {
    this.Map.addLayer(layer);
  }
  public RemoveLayer(layer) {
    this.Map.removeLayer(layer);
  }
  public AddInteraction(interaction: ol.interaction.Interaction) {
    this.Map.addInteraction(interaction);
  }
  public RemoveInteraction(interaction: ol.interaction.Interaction) {
    this.Map.removeInteraction(interaction);
  }
  public RemoveAllInteraction() {
    this.Map.getInteractions().forEach(i => this.Map.removeInteraction(i));
  }
  public AddControl(control: ol.control.Control | ContextMenu_Super) {
    if (control instanceof ContextMenu_Super)
      control.SetMap(this.Map);
    else // if (control instanceof ol.control.Control)
      this.Map.addControl(control);
  }
  private EnvironmentConfig(element: HTMLElement) {
    let hostName = this.Config.geoServerUrl;
    // let hostName = GetConfigManager().GetConfig("geoServerUrl");
    let control = new ol_PostionControl({ target: document.createElement("div"), projection: "EPSG:3857" });
    control.on('change', (e: ol.events.Event) => {
      // console.log(e);
    });

    this.Map = new ol_Map({
      controls: [control],
      target: element,
      // layers: [
      //   new ol_layer_Tile({ source: new ol_source_OSM() }),
      //   R_BG_Layer({ hostName: hostName }),
      //   V_Roads_Layer({ hostName: hostName }),
      //   V_Distance_Layer({ hostName: hostName }),
      //   V_Marks_Layer({ hostName: hostName })
      //   // aMapLayer
      // ],
      view: new ol_View({ center: ol_proj.transform(this.Config.centerPoint, this.Config.centerSrs, 'EPSG:3857'), zoom: this.Config.zoom })
    });

    if (this.Config.layers.OMS) this.Map.addLayer(new ol_layer_Tile({ source: new ol_source_OSM() }));
    if (this.Config.layers.bg) this.Map.addLayer(R_BG_Layer({ hostName: hostName, groupName: this.Config.geoServerGroup }));
    if (this.Config.layers.road) this.Map.addLayer(V_Roads_Layer({ hostName: hostName, groupName: this.Config.geoServerGroup }));
    if (this.Config.layers.distance) this.Map.addLayer(V_Distance_Layer({ hostName: hostName, groupName: this.Config.geoServerGroup }));
    if (this.Config.layers.marks) this.Map.addLayer(V_Marks_Layer({ hostName: hostName, groupName: this.Config.geoServerGroup }));


    let style = new ol_style({ stroke: new ol_stroke({ width: 6, color: "#04cf87" }) })
    this.RouteL = new ol_layer_vector({
      source: new ol_source_vector(),
      zIndex: 103,
      style: () => [style]
    });
    this.Map.addLayer(this.RouteL);

    let rangStyle = new ol_style({ stroke: new ol_stroke({ width: 2, color: '#8ccf1c' }) })
    this.RangeL = new ol_layer_vector({
      source: new ol_source_vector(),
      zIndex: 102,
      style: () => [rangStyle]
    });
    this.Map.addLayer(this.RangeL);

    // this.Map.on('postcompose',()=>{
    //     //TWEEN.update();
    // });
  }
  public AddPopup(callback: (feature: ol.Feature) => string, layer: ol.layer.Vector) {
    let popup = new olpopup();
    this.Map.addOverlay(popup);
    let s = new ol_select({
      layers: [layer]
    });
    s.on("select", (e: ol.interaction.Select.Event) => {
      let f = e.selected[0];
      if (f)
        popup.show((f.getGeometry() as ol.geom.Point).getCoordinates(), callback(e.selected[0]));
    })
    this.Map.addInteraction(s);

    // this.Map.on('singleclick', (e: ol.events.Event) => {
    //   popup.show(e["coordinate"], "popup");
    // });
  }

  public DrawRoute(route: string | Array<{ X: number, Y: number }> | ol.Feature, epsg: string = "EPSG:4326"): ol.Feature {
    if (route instanceof ol_feature) {
      this.RouteL.getSource().addFeature(route);
      return route;
    }
    let points: Array<{ X: number, Y: number }>;
    if (typeof route === 'string') points = JSON.parse(route);
    else
      points = route;
    if (points) {
      let pointArray: Array<[number, number]> = [];
      points.forEach(p => {
        pointArray.push(ol_proj.transform([p.X, p.Y], epsg, "EPSG:3857"));
      });
      let feature = new ol_feature(new ol_lineString(pointArray))
      this.RouteL.getSource().addFeature(feature);
      return feature;
    } else LogHelper.Error("DrawRoute():route is invalid")
  }
  /**
   * 画区域
   * @param ps 
   * @param epsg 
   */
  public DrawRange(ps: Array<{ X: number, Y: number }> | ol.Feature, epsg: string = "EPSG:4326"): ol.Feature {
    if (ps instanceof ol_feature) {
      this.RangeL.getSource().addFeature(ps);
      return ps;
    }
    if (ps) {
      let source = this.RangeL.getSource();
      let a: Array<[number, number]> = [];
      ps.forEach(p => a.push(ol_proj.transform([p.X, p.Y], epsg, "EPSG:3857")))
      let feature = new ol_feature(new ol_polygon([a]))
      source.addFeature(feature);
      return feature;
    } else LogHelper.Error(`DrawRange():ps is null`)
  }

  public GetCoordinate(e: Event): [number, number] {
    return this.Map.getEventCoordinate(e);
  }

  public Helper(helper?: Object) {
  }

  public Change(data: Object): void {
    throw new Error("Method not implemented.");
  }

  /**
   * 设置地图中心点
   * @param point 
   */
  public Focus(point: [number, number]) {
    this.Map.getView().setCenter(point);
  }

  public Render() {
    this.Map.render()
  }
  /**
   * 刷新特定图层
   * @param layer 
   */
  public Refresh(layer?: ol.layer.Layer) {
    //TODO refresh all layer in map
    layer.getSource().refresh();
  }
  /**
   * 
   * @param feature 
   * @param layer optional 
   */
  public RemoveDrawFeature(feature: ol.Feature, layer?: ol.layer.Vector) {
    if (!layer) layer = this.DrawL;
    if (!layer) return;
    layer.getSource().removeFeature(feature);
  }

  public SelectDraw(callback: (features: Array<ol.Feature>) => void, id: string = "1"): ol.interaction.Select {
    // if (!this.DrawL) return;
    let interactions = this.Map.getInteractions()
      , items = interactions.getArray().filter(i => i.get("levelId") == id);
    if (items)
      items.forEach(i => this.Map.removeInteraction(i));
    let s = new ol_select({
      layers: [this.DrawL],
      addCondition: ol_events_condition.click,
      removeCondition: ol_events_condition.click,
      condition: ol_events_condition.click,
      multi: true
    });
    s.on("select", (e: ol.interaction.Select.Event) => {
      callback(e.selected);
    })
    this.Map.addInteraction(s)
    return s;
  }
  /**
   * to select features in given layers
   * @param layers the given layers
   * @param callback the function to handle given features 
   * @param boxSelection the option with boolen type to launch box-selection. it is set true by default.
   */
  public SelectInLayer(layers: Array<ol.layer.Vector>, callback: (features: Array<ol.Feature>) => void, boxSelection: boolean = true): ol.interaction.Select {
    let s = new ol_select({
      layers: layers,
      addCondition: ol_events_condition.click,
      removeCondition: ol_events_condition.click,
      condition: ol_events_condition.click,
      multi: true
    });
    s.on("select", (e: ol.interaction.Select.Event) => {
      callback(e.selected);
    })
    this.AddInteraction(s)
    if (boxSelection) {
      let fs = s.getFeatures();
      let bs = new ol_box_selection({
        condition: ol_events_condition.platformModifierKeyOnly,
      });
      bs.on('boxend', e => {
        let extent = bs.getGeometry().getExtent()
        layers.forEach(l => {
          l.getSource().forEachFeatureIntersectingExtent(extent, f => {
            if (fs.getArray().indexOf(f) == -1)
              fs.push(f);
          })
        })
        callback(fs.getArray());
      })
      this.AddInteraction(bs)
    }
    return s;
  }

  /**
   * load wfs but be not added into map
   * @param callback 
   * @param gisServer 
   * @param typeName 
   * @param outputFormat is  'application/json' by default
   * @param viewPramaters 
   */
  public LoadWfs(callback: (layer: ol.layer.Vector) => void, gisServer: string, typeName: string, outputFormat: string = 'application/json', viewPramaters?: string) {
    let pams = `service=wfs&version=1.1.0&request=GetFeature&typeNames=${typeName}&outputFormat=${outputFormat}&${viewPramaters}`
    new Ajax({ url: `${gisServer}/wfs?${pams}` }).done(json => {
      let fs = new olFormatGeoJson().readFeatures(json);
      if (fs && fs.length > 0) {
        let layer = new ol_layer_vector({
          source: new ol_source_vector(),
          zIndex: 104,
          style: () => [new ol_style({ stroke: new ol_stroke({ width: 6, color: "#04cf87" }) })]
        });
        layer.getSource().addFeatures(fs);
        if (callback)
          callback(layer);
      }
    })
  }
  /**
   * 
   * @param type {"Box","LineString","Circle","Polygon"}
   * @param callback 
   * @param style 
   * @param id 
   */
  public Draw(type: string, callback: (feature) => void, style?: ol.style.Style, features?: Array<ol.Feature>, id: string = "1", multi: boolean = false): ol.interaction.Interaction {
    let source: ol.source.Vector;
    if (!this.DrawL) {
      this.DrawL = new ol_layer_vector({
        source: (source = new ol_source_vector()),
        zIndex: 105,
        style: style
      });
      this.Map.addLayer(this.DrawL);
    }
    else {
      source = this.DrawL.getSource();
    }

    let interactions = this.Map.getInteractions()
      , items = interactions.getArray().filter(i => i.get("levelId") == id);
    if (items)
      items.forEach(i => this.Map.removeInteraction(i));
    let geometryFunction = undefined;
    switch (type) {
      case "Box":
        geometryFunction = ol_draw.createBox();
        type = "Circle";
        break;
    }
    let draw = new ol_draw({
      source: source,
      type: type as ol.geom.GeometryType,
      geometryFunction: geometryFunction
    })
    draw.set("levelId", id)
    draw.on("drawend", (e: ol.interaction.Draw.Event) => {
      let f = e.feature;
      if (!multi)
        this.Map.removeInteraction(draw)
      callback(f);
    })
    this.Map.addInteraction(draw)
    if (features) {
      source.addFeatures(features);
      if (!multi)
        this.Map.removeInteraction(draw)
    }
    return draw;
  }
}
