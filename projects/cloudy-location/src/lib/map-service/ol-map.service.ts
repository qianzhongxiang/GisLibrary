import { FloorService } from './../floor/floor.service';
import { ConfigurationService } from './../configuration.service';
import { LogHelper, Ajax, ObserverableWMediator } from 'vincijs';
import { Injectable } from '@angular/core';
import { ContextMenu_Super } from './../../utilities/ContextMenu_Super';
import olFormatGeoJson from 'ol/format/GeoJson';
import ol_Map from 'ol/map';
import ol_style from 'ol/style/Style';
import ol_stroke from 'ol/style/Stroke';
import ol_fill from 'ol/style/Fill';
import ol_layer_vector from 'ol/layer/Vector';
import ol_source_vector from 'ol/source/Vector';
import ol_View from 'ol/view';
import ol_proj from 'ol/proj';
import ol_feature from 'ol/feature';
import ol_polygon from 'ol/geom/Polygon';
import ol_lineString from 'ol/geom/LineString';
import ol_circle from 'ol/geom/Circle';
import ol_draw from 'ol/interaction/Draw';
import ol_select from 'ol/interaction/Select';
import ol_PostionControl from 'ol/control/mouseposition';
import ol_box_selection from 'ol/interaction/DragBox';
import ol_events_condition from 'ol/events/condition';
import olpopup from 'ol-popup';
import overlay from 'ol/Overlay';
import { olx } from 'openlayers';

export type eventName = 'dblclick' | 'click' | 'pointermove' | 'movestart' | 'moveend';
export type ViewEventName = 'change:resolution';
export type LayerType = 'Draw' | 'Route' | 'Range';
@Injectable()
export class OlMapService extends ObserverableWMediator {
  public Events = { FloorChanged: 'FloorChanged' };
  private _routel: ol.layer.Vector;
  public Map: ol.Map;
  private get RouteL(): ol.layer.Vector {
    if (!this._routel) {
      // layer of route
      const style = new ol_style({ stroke: new ol_stroke({ width: 6, color: '#04cf87' }) });
      this._routel = new ol_layer_vector({
        source: new ol_source_vector(),
        zIndex: 103,
        style: () => [style]
      });
      this.AddLayer(this._routel);
    }
    return this._routel;
  }
  private _rangel: ol.layer.Vector;
  private get RangeL(): ol.layer.Vector {
    if (!this._rangel) {
      // layer of range/region
      const rangStyle = new ol_style({ stroke: new ol_stroke({ width: 2, color: '#8ccf1c' }) });
      this._rangel = new ol_layer_vector({
        source: new ol_source_vector(),
        zIndex: 102,
        style: () => {
          return [rangStyle];
        }
      });
      this.AddLayer(this._rangel);
    }
    return this._rangel;
  }



  private _drawl: ol.layer.Vector;
  private get DrawL(): ol.layer.Vector {
    if (!this._drawl) {
      this._drawl = new ol_layer_vector({
        source: new ol_source_vector(),
        zIndex: 105,
        style: () => [this.DefaultStyle]
      });
      this.AddLayer(this._drawl);
    }
    return this._drawl;
  }

  public DefaultStyle = new ol_style({ stroke: new ol_stroke({ width: 2, color: '#8ccf1c' }) });
  /**
   * 获取矢量图层
   * @param type "route|range|draw"
   */
  public GetVectorLayer(type: LayerType): ol.layer.Vector {
    switch (type.toLowerCase()) {
      case 'route':
        return this.RouteL;
      case 'range':
        return this.RangeL;
      case 'draw':
        return this.DrawL;
    }
  }
  constructor(private configurationService: ConfigurationService, private floorService: FloorService) {
    super();
    // init options of floor service
    let mapConfig = this.configurationService.MapConfig;
    this.floorService.SetOptions({
      layerOptions: {
        hostName: mapConfig.geoServerUrl
        , groupName: mapConfig.geoServerGroup, GWC: mapConfig.GWC, maxResolution: mapConfig.maxResolution
        , minResolution: mapConfig.minResolution, resolutions: mapConfig.resolutions, extent: mapConfig.extent
        , origins: mapConfig.origins
      }
      , floors: (mapConfig.layers instanceof Array ? mapConfig.layers : [mapConfig.layers])
    });
    //listening to changing of floor, and call setFloor
    this.floorService.Bind(this.floorService.Events.Changed, () => this.SetFloor());
  }
  public Rotate(rotation: number, opt_anchor?: ol.Coordinate) {
    this.Map.getView().rotate(rotation, opt_anchor);
  }

  public SetStyle(type: LayerType,
    styleFn: (feature: ol.Feature, resolution: number) => (ol.style.Style | ol.style.Style[])) {
    switch (type.toLowerCase()) {
      case 'route':
        this.RouteL.setStyle(styleFn);
        break;
      case 'range':
        this.RangeL.setStyle(styleFn);
        break;
      case 'draw':
        this.DrawL.setStyle(styleFn);
        break;
    }
  }

  public GetStyle(options: {
    stroke?: olx.style.StrokeOptions, zIndex?: number,
    fill?: olx.style.FillOptions
  }): ol.style.Style {

    const style = new ol_style();
    if (options.stroke) {
      style.setStroke(new ol_stroke(options.stroke));
    }
    if (options.fill) {
      style.setFill(new ol_fill(options.fill));
    }
    if (options.zIndex) {
      style.setZIndex(options.zIndex);
    }
    return style;
  }
  public Show(data: { target: HTMLElement }) {
    this.EnvironmentConfig(data.target);
  }
  /**
   * set floor info
   */
  public SetFloor() {
    //remove all layer even though drawing layer
    [...this.Map.getLayers().getArray()]
      .forEach(l => this.Map.removeLayer(l));
    //add layers from new floor
    this.InitLayers();
    this.SetState(this.Events.FloorChanged);
  }
  /**
   * add layer for map view, call "AddLayer()" after Event.FloorChanged if floorSwitcher is setted by true
   * @param layer
   * @param forPerFloor
   */
  public AddLayer(layer: ol.layer.Layer, forPerFloor?: boolean) {
    this.addLayer(layer);
    if (forPerFloor) {
      this.floorService.AddLayers([layer], false);
    }
    else {
      this.floorService.AddLayers([layer]);
    }
  }
  /**
   * 内部 添加图层方法
   */
  private addLayer(layer: ol.layer.Layer | ol.layer.Group) {
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
    if (control instanceof ContextMenu_Super) {
      control.SetMap(this.Map);
    } else { // if (control instanceof ol.control.Control)
      this.Map.addControl(control);
    }
  }

  public ViewOn(eventName: ViewEventName | ViewEventName[], fn: (evt: ol.events.Event) => void) {
    this.Map.getView().on(eventName, fn);
  }
  /**
   * 订阅Map事件
   * @param eventName 事件名称 'dblclick'|'click'|'pointermove' 后续添加其余事件
   * @param fn 
   * @param indicateFeature 
   */
  public MapOn(eventName: eventName | eventName[], fn: (evt: ol.events.Event, pixel: [number, number], feature?: ol.Feature) => void, indicateFeature: boolean = false) {
    this.Map.on(eventName, (evt) => {
      let pixel: [number, number], feature: ol.Feature;
      switch (evt.type) {
        case 'pointermove':
          pixel = this.Map.getEventPixel(evt['originalEvent']);
          break;
        case 'click':
          pixel = evt['pixel'];
          break;
        case 'dblclick':
          pixel = evt['pixel'];
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
    let mapConfig = this.configurationService.MapConfig;
    let control = new ol_PostionControl({ target: document.createElement('div'), projection: 'EPSG:3857' });

    let vo: olx.ViewOptions =// { zoom: 4, center: [0, 0] }
    {
      center: ol_proj.transform(mapConfig.centerPoint as [number, number], mapConfig.centerSrs, mapConfig.frontEndEpsg), zoom: mapConfig.zoom,
      zoomFactor: mapConfig.zoomfactor, minResolution: mapConfig.minResolution, maxResolution: mapConfig.maxResolution,
      resolutions: mapConfig.resolutions
    };
    if (mapConfig.zoomrange) {
      vo.minZoom = mapConfig.zoomrange[0];
      vo.maxZoom = mapConfig.zoomrange[1];
    }
    this.Map = new ol_Map({
      controls: [control],
      target: element,
      view: new ol_View(vo)
    });
    this.InitLayers();
  }
  private InitLayers() {
    this.floorService.GetLayers().forEach(l => this.addLayer(l));
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
    s.on('select', (e: ol.interaction.Select.Event) => {
      let f = e.selected[0];
      if (f) {
        popup.show((f.getGeometry() as ol.geom.Point).getCoordinates(), callback(e.selected[0]));
      }
    });
    this.Map.addInteraction(s);

    // this.Map.on('singleclick', (e: ol.events.Event) => {
    //   popup.show(e["coordinate"], "popup");
    // });
  }
  public DrawRoute(route: string | Array<{ X: number, Y: number }> | ol.Feature, styleOptions?: { width?: number, color?: string }): ol.Feature {

    if (styleOptions) {
      styleOptions = Object.assign({ width: 6, color: '#04cf87' }, styleOptions);
      this.RouteL.setStyle(() => [new ol_style({ stroke: new ol_stroke({ width: styleOptions.width, color: styleOptions.color }) })]);
    }
    if (route instanceof ol_feature) {
      this.RouteL.getSource().addFeature(route);
      return route;
    }
    let points: Array<{ X: number, Y: number }>;
    if (typeof route === 'string') { points = JSON.parse(route); }
    else {
      points = route;
    }
    if (points) {
      let pointArray: Array<[number, number]> = [];
      points.forEach(p => {
        pointArray.push(ol_proj.transform([p.X, p.Y], this.configurationService.MapConfig.srs, this.configurationService.MapConfig.frontEndEpsg));
      });
      let feature = new ol_feature(new ol_lineString(pointArray));
      this.RouteL.getSource().addFeature(feature);
      return feature;
    } else { LogHelper.Error('DrawRoute():route is invalid'); }
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
      const source = this.RangeL.getSource();
      const a: Array<[number, number]> = [];
      ps.forEach(p => a.push(ol_proj.transform([p.X, p.Y]
        , this.configurationService.MapConfig.srs, this.configurationService.MapConfig.frontEndEpsg)));
      const feature = new ol_feature(new ol_polygon([a]));
      source.addFeature(feature);
      return feature;
    } else { LogHelper.Error(`DrawRange():ps is null`); }
  }

  public GetCoordinate(e: Event): [number, number] {
    return this.Map.getEventCoordinate(e);
  }


  /**
   * 设置地图中心点
   * @param point 
   * @param _sourceSrs is srs of point, by default is srs be setted by configuration file;
   */
  public Focus(point: [number, number], _sourceSrs?: string) {
    point = ol_proj.transform(point, _sourceSrs || this.configurationService.MapConfig.srs
      , this.configurationService.MapConfig.frontEndEpsg);
    this.Map.getView().setCenter(point);
  }

  public Render() {
    this.Map.render();
  }
  /**
   * 刷新特定图层
   * @param layer 
   */
  public Refresh(layer?: ol.layer.Layer) {
    // TODO refresh all layer in map
    layer.getSource().refresh();
  }
  /**
   * 
   * @param feature 
   * @param layer optional 
   */
  public RemoveDrawFeature(feature: ol.Feature, layer?: ol.layer.Vector) {
    if (!layer) { layer = this.DrawL; }
    if (!layer) { return; }
    layer.getSource().removeFeature(feature);
  }
  /**
   * use return select to get all feature; 选择一个图元之后，features为1，再次选择则为0
   * @param callback just get last selected feature
   * @param id
   * @param multi
   */
  public SelectDraw(callback: (features: Array<ol.Feature>) => void, id: string = '1', multi: boolean = true): ol.interaction.Select {
    // if (!this.DrawL) return;
    const interactions = this.Map.getInteractions()
      , items = interactions.getArray().filter(i => i.get('levelId') == id);
    if (items) {
      items.forEach(i => this.Map.removeInteraction(i));
    }
    const s = new ol_select({
      layers: [this.DrawL],
      addCondition: ol_events_condition.click,
      removeCondition: ol_events_condition.click,
      condition: multi ? ol_events_condition.click : ol_events_condition.singleClick,
      multi: multi
    });
    s.set('levelId', id);
    s.on('select', (e: ol.interaction.Select.Event) => {
      callback(e.selected);
    });
    this.Map.addInteraction(s);
    return s;
  }
  /**
   * to select features in given layers
   * @param layers the given layers
   * @param callback the function to handle given features 
   * @param boxSelection the option with boolen type to launch box-selection. it is set true by default.
   */
  public SelectInLayer(layers: Array<ol.layer.Vector>, callback: (features: Array<ol.Feature>) => void
    , boxSelection: boolean = true, multi: boolean = true, id: string = '1'): ol.interaction.Select {
    const interactions = this.Map.getInteractions()
      , items = interactions.getArray().filter(i => i.get('levelId') == id);
    if (items) {
      items.forEach(i => this.Map.removeInteraction(i));
    }
    const s = new ol_select({
      layers: layers,
      multi: multi,
      addCondition: ol_events_condition.click,
      removeCondition: ol_events_condition.click,
      condition: multi ? ol_events_condition.click : ol_events_condition.singleClick,
    });
    s.on('select', (e: ol.interaction.Select.Event) => {
      callback(e.selected);
    });
    s.set('levelId', id);

    this.AddInteraction(s);
    if (boxSelection) {
      let fs = s.getFeatures();
      let bs = new ol_box_selection({
        condition: ol_events_condition.platformModifierKeyOnly,
      });
      bs.on('boxend', () => {
        let extent = bs.getGeometry().getExtent();
        layers.forEach(l => {
          l.getSource().forEachFeatureIntersectingExtent(extent, f => {
            if (fs.getArray().indexOf(f) == -1) {
              fs.push(f);
            }
          });
        });
        callback(fs.getArray());
      });
      this.AddInteraction(bs);
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
  public LoadWfs(callback: (layer: ol.layer.Vector) => void, gisServer: string, typeName: string
    , outputFormat: string = 'application/json', viewPramaters?: string) {
    const pams = `service=wfs&version=1.1.0&request=GetFeature&typeNames=${typeName}&outputFormat=${outputFormat}&${viewPramaters}`;
    new Ajax({ url: `${gisServer}/wfs?${pams}` }).done(json => {
      const fs = new olFormatGeoJson().readFeatures(json);
      if (fs && fs.length > 0) {
        const layer = new ol_layer_vector({
          source: new ol_source_vector(),
          zIndex: 104,
          style: () => [new ol_style({ stroke: new ol_stroke({ width: 6, color: '#04cf87' }) })]
        });
        layer.getSource().addFeatures(fs);
        if (callback) {
          callback(layer);
        }
      }
    });
  }
  /**
   * add features into layer
   * @param type layer type
   * @param fs features which will be added
   */
  public AddFeatures(type: LayerType, fs: ol.Feature[]) {
    switch (type) {
      case 'Draw':
        this.DrawL.getSource().addFeatures(fs);
        break;
      case 'Route':
        this.RouteL.getSource().addFeatures(fs);
        break;
      case 'Range':
        this.RangeL.getSource().addFeatures(fs);
        break;
      default:
        break;
    }
  }
  /**
   * 
   * @param type 
   * @param fs 
   */
  public RemoveFeatures(type: LayerType, fs: ol.Feature[]) {
    switch (type) {
      case 'Draw':
        fs.forEach(f => this.DrawL.getSource().removeFeature(f));
        break;
      case 'Route':
        fs.forEach(f => this.RouteL.getSource().removeFeature(f));
        break;
      case 'Range':
        fs.forEach(f => this.RangeL.getSource().removeFeature(f));
        break;
      default:
        break;
    }
  }
  /**
   * 
   * @param type 
   */
  public GetFeatures(type: LayerType): ol.Feature[] {
    switch (type) {
      case 'Draw':
        return this.DrawL.getSource().getFeatures();
      case 'Route':
        return this.DrawL.getSource().getFeatures();
      case 'Range':
        return this.DrawL.getSource().getFeatures();
      default:
        break;
    }
  }
  /**
   * 
   * @param type 
   */
  public LayerClear(type: LayerType) {
    switch (type) {
      case 'Draw':
        this.DrawL.getSource().clear();
        break;
      case 'Route':
        this.RouteL.getSource().clear();
        break;
      case 'Range':
        this.RangeL.getSource().clear();
        break;
      default:
        break;
    }
  }
  /**
   * can add some features if have no type gaven
   * @param type {"Box","LineString","Circle","Polygon"}
   * @param callback 
   * @param style if style is function, then it can style feature customly,
   * but if style is an array ,then all feature will apply same styles
   * @param id 
   */
  public Draw(type?: 'Box' | 'LineString' | 'Circle' | 'Polygon' | 'Point',
    callback?: (feature: ol.Feature) => void, styles?: (f: ol.Feature) => ol.style.Style[]
    , features?: Array<ol.Feature>, id: string = '1', multi: boolean = false): ol.interaction.Interaction {
    this.DrawL.setStyle((f: ol.Feature) => {
      if (styles) { return styles(f); } else {
        return [this.DefaultStyle];
      }
    });
    const source = this.DrawL.getSource();
    if (features) { source.addFeatures(features); }
    // drawing logic
    let draw: ol.interaction.Draw;
    if (type) {
      const interactions = this.Map.getInteractions()
        , items = interactions.getArray().filter(i => i.get('levelId') == id);
      if (items) {
        items.forEach(i => this.Map.removeInteraction(i));
      }
      let geometryFunction;
      switch (type) {
        case 'Box':
          geometryFunction = ol_draw.createBox();
          type = 'Circle';
          break;
      }
      draw = new ol_draw({
        source: source,
        type: type as ol.geom.GeometryType,
        geometryFunction: geometryFunction
      });
      draw.set('levelId', id);
      draw.on('drawend', (e: ol.interaction.Draw.Event) => {
        const f = e.feature;
        if (!multi) {
          this.Map.removeInteraction(draw);
        }
        if (callback) {
          callback(f);
        }
      });
      this.Map.addInteraction(draw);
    }
    return draw;
  }

  /**
   * CreateFeature method can help to create ol.feature; points will be converted by default; but can change it manuely;
   * @param type "LineString" | "Circle" | "Polygon"
   * @param points locations
   * @param sourceSrs optionial  MapConfig.srs
   */
  public CreateFeature(type: 'LineString' | 'Circle' | 'Polygon', points: [number, number][], sourceSrs?: string): ol.Feature {
    let geom: ol.geom.Geometry;
    // epsg transform
    points = points.map(p => ol_proj.transform(p, sourceSrs || this.configurationService.MapConfig.srs
      , this.configurationService.MapConfig.frontEndEpsg));
    switch (type.toLowerCase()) {
      case 'linestring':
        geom = new ol_lineString(points);
        break;
      case 'circle':
        geom = new ol_circle(points[0], new ol_lineString(points).getLength());
        break;
      case 'polygon':
        geom = new ol_polygon([points]);
        break;
    }
    return new ol_feature(geom);
  }


}
