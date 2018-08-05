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
import ol_circle from 'ol/geom/Circle';
import ol_point from 'ol/geom/Point';
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
import overlay from 'ol/Overlay';
import { olx } from 'openlayers';
import V_Regions_Layer from '../../layers/V_Regions_Layer';

export type eventName = 'dblclick' | 'click' | 'pointermove'
export type ViewEventName = 'change:resolution'
@Injectable()
export class OlMapService {
  private RouteL: ol.layer.Vector
  private RangeL: ol.layer.Vector
  private DrawL: ol.layer.Vector
  private Config: MapConifg
  private DefaultStyle = new ol_style({ stroke: new ol_stroke({ width: 2, color: '#8ccf1c' }) })
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
    this.Config = Object.assign({ scs: "EPSG:4326", frontEndEpsg: "EPSG:3857" }, Config)
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
  public AddOverlay(options: olx.OverlayOptions): ol.Overlay {
    let o = new overlay(options);
    this.Map.addOverlay(o);
    return o;
  }
  public RemoveOverlay(overlay: ol.Overlay) {
    this.Map.removeOverlay(overlay);
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

  public ViewOn(eventName: ViewEventName | ViewEventName[], fn: (evt: ol.events.Event) => void) {
    this.Map.getView().on(eventName, fn)
  }
  /**
   * 订阅Map事件
   * @param eventName 事件名称 'dblclick'|'click'|'pointermove' 后续添加其余事件
   * @param fn 
   * @param indicateFeature 
   */
  public MapOn(eventName: eventName | eventName[], fn: (evt: ol.events.Event, pixel: [number, number], feature?: ol.Feature) => void, indicateFeature: boolean = false) {
    this.Map.on(eventName, (evt) => {
      let pixel: [number, number], feature: ol.Feature
      switch (evt.type) {
        case 'pointermove':
          pixel = this.Map.getEventPixel(evt["originalEvent"])
          break;
        case 'click':
          pixel = evt["pixel"]
          break;
        case 'dblclick':
          pixel = evt["pixel"]
          break;
        default:
          break;
      }

      if (indicateFeature) {
        feature = this.Map.forEachFeatureAtPixel(pixel, function (feature) {
          return feature;
        }) as ol.Feature;
      }
      fn(evt, pixel, feature);
    });

  }
  /**
   * 初始化地图
   * @param element 
   */
  private EnvironmentConfig(element: HTMLElement) {
    let hostName = this.Config.geoServerUrl;
    // let hostName = GetConfigManager().GetConfig("geoServerUrl");
    let control = new ol_PostionControl({ target: document.createElement("div"), projection: "EPSG:3857" });
    control.on('change', (e: ol.events.Event) => {
      // console.log(e);
    });
    let vo: olx.ViewOptions =// { zoom: 4, center: [0, 0] }
      {
        center: ol_proj.transform(this.Config.centerPoint as [number, number], this.Config.centerSrs, this.Config.frontEndEpsg), zoom: this.Config.zoom,
        zoomFactor: this.Config.zoomfactor, minResolution: this.Config.minResolution, maxResolution: this.Config.maxResolution
      }
    if (this.Config.zoomrange) {
      vo.minZoom = this.Config.zoomrange[0];
      vo.maxZoom = this.Config.zoomrange[1];
    }
    this.Map = new ol_Map({
      controls: [control],
      target: element,
      view: new ol_View(vo)
    });

    if (this.Config.layers.OMS) this.Map.addLayer(new ol_layer_Tile({ source: new ol_source_OSM() }));
    if (this.Config.layers.bg) this.Map.addLayer(R_BG_Layer({ hostName: hostName, groupName: this.Config.geoServerGroup, GWC: this.Config.GWC, dpi: 300 }));
    if (this.Config.layers.regions) this.Map.addLayer(V_Regions_Layer({ hostName: hostName, groupName: this.Config.geoServerGroup }));
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

  }
  //region ZOOM
  /**
   * 
   */
  public get Zoom(): number {
    return this.Map.getView().getZoom();
  }
  public set Zoom(value: number) {
    this.Map.getView().setZoom(value);
  }
  //endregion
  /**
   * 
   * @param callback 
   * @param layer 
   */
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
  public DrawRoute(route: string | Array<{ X: number, Y: number }> | ol.Feature, styleOptions?: { width?: number, color?: string }): ol.Feature {
    if (styleOptions) {
      styleOptions = Object.assign({ width: 6, color: "#04cf87" }, styleOptions)
      this.RouteL.setStyle(() => [new ol_style({ stroke: new ol_stroke({ width: styleOptions.width, color: styleOptions.color }) })])
    }
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
        pointArray.push(ol_proj.transform([p.X, p.Y], this.Config.srs, this.Config.frontEndEpsg));
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
  public DrawRange(ps: Array<{ X: number, Y: number }> | ol.Feature): ol.Feature {
    if (ps instanceof ol_feature) {
      this.RangeL.getSource().addFeature(ps);
      return ps;
    }
    if (ps) {
      let source = this.RangeL.getSource();
      let a: Array<[number, number]> = [];
      ps.forEach(p => a.push(ol_proj.transform([p.X, p.Y], this.Config.srs, this.Config.frontEndEpsg)))
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
    if (this.Config.srs)
      point = ol_proj.transform(point, this.Config.srs, this.Config.frontEndEpsg)
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
  /**
   * use return select to get all feature
   * @param callback just get last selected feature
   * @param id 
   */
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
  public SelectInLayer(layers: Array<ol.layer.Vector>, callback: (features: Array<ol.Feature>) => void, boxSelection: boolean = true, multi: boolean = true): ol.interaction.Select {
    let options: any = {
      layers: layers,
      multi: multi
    }
    if (multi) {
      options.addCondition = ol_events_condition.click
      options.removeCondition = ol_events_condition.click
      options.condition = ol_events_condition.click
    }

    let s = new ol_select(options);
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
   * can add some features if have no type gaven
   * @param type {"Box","LineString","Circle","Polygon"}
   * @param callback 
   * @param style if style is function, then it can style feature customly, but if style is an array ,then all feature will apply same styles
   * @param id 
   */
  public Draw(type?: "Box" | "LineString" | "Circle" | "Polygon", callback?: (feature) => void, styles?: (f: ol.Feature) => ol.style.Style[]
    , features?: Array<ol.Feature>, id: string = "1", multi: boolean = false): ol.interaction.Interaction {
    if (!this.DrawL) {
      this.DrawL = new ol_layer_vector({
        source: new ol_source_vector(),
        zIndex: 105
      });
      this.Map.addLayer(this.DrawL);
    }
    this.DrawL.setStyle((f: ol.Feature) => {
      if (styles) return styles(f)
      else {
        return [this.DefaultStyle];
      }
    })
    let source = this.DrawL.getSource();
    if (features) source.addFeatures(features);
    //drawing logic
    let draw: ol.interaction.Draw
    if (type) {
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
      draw = new ol_draw({
        source: source,
        type: type as ol.geom.GeometryType,
        geometryFunction: geometryFunction
      })
      draw.set("levelId", id)
      draw.on("drawend", (e: ol.interaction.Draw.Event) => {
        let f = e.feature;
        if (!multi)
          this.Map.removeInteraction(draw)
        if (callback)
          callback(f);
      })
      this.Map.addInteraction(draw)
    }
    return draw;
  }

  /**
   * 
   * @param type "LineString" | "Circle" | "Polygon"
   * @param points 
   */
  public CreateFeature(type: "LineString" | "Circle" | "Polygon", points: [number, number][]): ol.Feature {
    let geom: ol.geom.Geometry
    //epsg transform
    points = points.map(p => ol_proj.transform(p, this.Config.srs, this.Config.frontEndEpsg))
    switch (type.toLowerCase()) {
      case "linestring":
        geom = new ol_lineString(points)
        break;
      case "circle":
        geom = new ol_circle(points[0], new ol_lineString(points).getLength());
        break
      case "polygon":
        geom = new ol_polygon([points])
        break
    }
    return new ol_feature(geom);
  }


}
