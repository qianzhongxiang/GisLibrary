import { FloorService } from './../floor/floor.service';
import { ConfigurationService } from './../configuration.service';
import { RepairingDecorator } from './../../graphic/repiringDecorator';
import { TextGraphic } from './../../graphic/textGraphic';
import { Decorator } from './../../graphic/decorator';
import { OfflineDecorator } from './../../graphic/offlineDecorator';
import { HighlightDecorator } from './../../graphic/highlightDecorator';
import { BaseGraphic } from './../../graphic/BaseGraphic';
import { Injectable } from '@angular/core';
import { GraphicOutInfo, GetGraphicFactory, IGraphic } from './../../graphic/graphics';
import { ObserverableWMediator, LogHelper, WebSocketor, Composit } from 'vincijs';
import VertorSource from 'ol/source/Vector';
import VertorLayer from 'ol/layer/Vector';
import ol_proj from 'ol/proj';
import { GetProjByEPSG } from './../../utilities/olProjConvert';
import { DataItem, MsgEntity, Id_TypeGenerator } from './../../utilities/entities';
import * as mqtt from 'mqtt';
import * as jQuery from 'jquery';
import { DeviceStatus } from '../../utilities/enum';
class point extends BaseGraphic {
  constructor() {
    super();
    this.Options.color = 'blue';
    this.Add(new TextGraphic());
  }
}


/**
 * manager dependent on TWEEN
 */
@Injectable()
export class DeviceService extends ObserverableWMediator {
  private socket: WebSocketor;
  public Coms: { [key: string]: GraphicOutInfo } = {};
  private VectorSource: ol.source.Vector;
  private Layer: ol.layer.Vector;
  public Events = {
    WSOpened: 'WSOpened', WSClosed: 'WSClosed'
    , DeviceUpdate: 'DeviceUpdate', MsgChange: 'MsgChange', StyleCreating: 'StyleCreating'
  };
  private HighlightedId: string;
  public durTimes = 1;
  private Filter: (graphic: GraphicOutInfo) => boolean;
  constructor(private ConfigurationService: ConfigurationService, private FloorService: FloorService) {
    super();
    GetGraphicFactory().SetDef(point, 'base');
    GetGraphicFactory().SetDef(HighlightDecorator, 'highlight');
    GetGraphicFactory().SetDef(OfflineDecorator, 'offline');
    GetGraphicFactory().SetDef(Decorator, 'decorator');
    GetGraphicFactory().SetDef(RepairingDecorator, 'repairing');
    this.VectorSource = new VertorSource();
    this.Layer = new VertorLayer({
      source: this.VectorSource, style: this.StyleFn.bind(this)
    });
    this.Layer.setZIndex(200);
    // listening to floor changed
    this.FloorService.Bind(this.FloorService.Events.Changed, this.SetFloor.bind(this));
  }
  private StyleFn(f: ol.Feature) {
    const id = f.get('uid'), type = f.get('type'), c = this.Obtain(id as string, type)
      , direction = c.Direction;
    if (this.Filter && !this.Filter(c)) { return []; }
    const graphic = GetGraphicFactory().GetComponent(`${c.Type}.${c.SubType}`);
    this.SetState(this.Events.StyleCreating, c);
    let decorator = GetGraphicFactory().GetDef('decorator') as Decorator;
    decorator.RemoveAll();
    decorator.Add(graphic);
    decorator.AssignOption({
      color: c.Color, content: c.Title || id.toString()
      , rotation: direction
    });
    if (c && c.Repairing) {
      decorator = this.GenerateDecorator(decorator, 'repairing');
    }
    if (c && c.Offline) {
      decorator = this.GenerateDecorator(decorator, 'offline');
    }
    if (this.HighlightedId && this.HighlightedId == id) {
      decorator = this.GenerateDecorator(decorator, 'highlight');
    }

    return decorator.Style();
  }

  public Refresh() {
    this.Layer.getSource().refresh();
  }
  /**
   * 为graphy提供装饰器生成
   */
  private GenerateDecorator(subItem: IGraphic, item: string): Decorator {
    let container = GetGraphicFactory().GetDef(item) as Decorator;
    container.RemoveAll();
    container.Add(subItem);
    return container;
  }
  public SetFloor() {
    // remove all feature
    this.Layer.getSource().clear();
    for (let n in this.Coms) {
      this.AddFeature(this.Coms[n], true);
    }
  }
  /**
   * add or remove feature in map view
   * @param info 
   */
  private AddFeature(info: GraphicOutInfo, newF?: boolean) {

    let idtype = Id_TypeGenerator(info.Id, info.Type), f;
    if (!this.ConfigurationService.MapConfig.floorSwitcher) {
      if (newF) {
        let graphic = info.Graphic = GetGraphicFactory().GetComponent(`${info.Type}.${info.SubType}`);
        let feature = graphic.GetGeom([info.Location.x, info.Location.y]);
        feature.setId(idtype);
        // feature.setId(info.Id);
        feature.set('uid', info.Id);
        feature.set('type', info.Type);
        // 内部有验证 id是否存在 store是一个对象 so id可以是字符串
        this.VectorSource.addFeature(feature);
      }
      return;
    }

    if (info.Floor === undefined || info.Floor == this.FloorService.GetFloorNo()) {
      let graphic = info.Graphic = GetGraphicFactory().GetComponent(`${info.Type}.${info.SubType}`);
      let feature = graphic.GetGeom([info.Location.x, info.Location.y]);
      feature.setId(idtype);
      // feature.setId(info.Id);
      feature.set('uid', info.Id);
      feature.set('type', info.Type);
      // 内部有验证 id是否存在 store是一个对象 so id可以是字符串
      this.VectorSource.addFeature(feature);
    } else if (f = this.VectorSource.getFeatureById(idtype)) { this.VectorSource.removeFeature(f); }
  }

  /**
   * outside api for add a kind of graphic
   * @param type a kind of graphic
   * @param name name of graphic
   */
  public AddGraphic(type: typeof Composit, name: string) {
    if (GetGraphicFactory().DefsContains(name)) {
      GetGraphicFactory().SetDef(type, name);
    } else {
      GetGraphicFactory().SetComponent(type, name);
    }
  }
  public GetLayer(): ol.layer.Vector {
    return this.Layer;
  }
  //#region data-item query operation
  /**
   * 获取GraphicOutInfo
   * @param Id
   */
  public Obtain(id: string, type: string): GraphicOutInfo {
    return this.Coms[Id_TypeGenerator(id, type)];
  }
  public GetPosition(id: string, type: string): [number, number] {
    return (this.Layer.getSource().getFeatureById(Id_TypeGenerator(id, type)).getGeometry() as ol.geom.Point).getCoordinates();
  }
  public GetFeature(id: string, type: string): ol.Feature {
    return this.Layer.getSource().getFeatureById(Id_TypeGenerator(id, type));
  }
  public UpdateTitle(id: string, type: string, title: string) {
    const c = this.Obtain(id, type);
    if (c) {
      c.Title = title;
      const f = this.Layer.getSource().getFeatureById(Id_TypeGenerator(id, type));
      if (!f) { LogHelper.Log('UpdateTitle：can not found feature with id:' + id); return; }
      f.set('name', title);
    }
  }
  public Find(fn: (obj: GraphicOutInfo) => boolean): Array<GraphicOutInfo> {
    let res: Array<GraphicOutInfo> = [];
    for (let n in this.Coms) {
      let obj = this.Coms[n] as GraphicOutInfo;
      if (fn(obj)) { res.push(obj); }
    }
    return res;
  }
  //#endregion

  //#region device pocessing, moving, etc.
  /**
     *
     * @param id
     * @param location
     * @param duration
     */
  private ComponentMove(id: string, type: string, loc: { x: number; y: number; }): DeviceService { // TODO 若chain堆积太多 则必须对象位置需跳过前面tweens
    let graphic: GraphicOutInfo, idtype = Id_TypeGenerator(id, type);
    // TODO 判断位置如果相同不进行任何操作;
    if (graphic = this.Obtain(id, type)) {
      let feature = this.VectorSource.getFeatureById(idtype);
      if (feature) (feature.getGeometry() as ol.geom.Point).setCoordinates([loc.x, loc.y]);
    }
    else {
      console.log('err:' + + ' 在Coms中不存在');
    }
    return this;
  }

  /**
   * to launch procession to process data from coordinate websocket which can be closed by invoke "ProcessClose" method
   * @param callback
   * @param posiConvertor coordinate convertor
   */
  public DataProcess(callback: (gif: GraphicOutInfo, type: DeviceStatus) => void
    , posiConvertor?: (posi: [number, number]) => [number, number], dataFilter?: (dataItem: DataItem) => boolean): DeviceService {
    let mapConfig = this.ConfigurationService.MapConfig;
    let type = mapConfig.locationConfig.wsType;
    let url = mapConfig.locationConfig.locationURI;
    switch (type) {
      case 'ws':
        if (this.socket) { return this; }
        this.socket = new WebSocketor({ Url: url });
        this.socket.Open(evt => {
          try {
            let datas = JSON.parse(evt.data);
            this.Resolve(datas, callback, posiConvertor, dataFilter);
          } catch (error) {
            LogHelper.Error(error)
          }
        }, () => {
          this.SetState(this.Events.WSOpened, this.socket);
        });
        // 离线socket
        let msgWS = new WebSocketor({ Url: 'ws://223.68.186.220:3723' });
        msgWS.Open(evt => {
          try {
            let datas = JSON.parse(evt.data);
            let array = datas as Array<MsgEntity>
            array.forEach(i => {
              let item = this.Obtain(i.Uid, i.DevType);
              if (item && !item.Offline) {
                item.Offline = true;
                callback(item, DeviceStatus.Offline)
                this.SetState(this.Events.DeviceUpdate, { data: item, type: DeviceStatus.Offline })
              }
            })
            this.VectorSource.refresh();
          } catch (error) {
            LogHelper.Error(error)
          }
        }, () => {
        });
        break;
      case 'mqtt':
        const t = mapConfig.locationConfig.mqttTopic,
          devMsg = 'devMsg'
          , user = mapConfig.mqttUser
          , pd = mapConfig.mqttPd
          , client = mqtt.connect(url, { username: user, password: pd });
        client.on('message', (topic, message) => {
          // message is Buffer
          const str = message.toString();
          // console.log(str)
          try {
            const datas = JSON.parse(str);
            switch (topic) {
              case t:
                this.Resolve([datas], callback, posiConvertor, dataFilter);
                break;
              case devMsg:
                const array = datas as Array<MsgEntity>;
                array.forEach(i => {
                  const item = this.Obtain(i.Uid, i.DevType);
                  if (item) { item.Offline = true; }
                });
                this.SetState(this.Events.MsgChange, array);
                break;
            }
          } catch (error) {
            LogHelper.Error(error);
          }
        });
        client.on('connect', () => {
          client.subscribe(t);
          client.subscribe(devMsg);
          // client.publish('presence', 'Hello mqtt')
        });

        break;
    }
    return this;
  }
  /**
   * 设备位置初始化
   * @param items {id}_{type},{id}_{type}
   * @param callback 回调
   * @param posiConvertor 坐标转换
   */
  public DevPositionInit(items: string, callback: (gif: GraphicOutInfo, type: DeviceStatus) => void
    , posiConvertor?: (posi: [number, number]) => [number, number]) {
    if (!this.ConfigurationService.MapConfig.webService) { return; }
    let url = this.ConfigurationService.MapConfig.webService + `/DeviceProfileGet?callback=?`;
    this.Jsonp(url, { items: items }, (s) => {
      if (!s) { return; }
      let ds: Array<{ DevState: number, LocationItem: DataItem }> = JSON.parse(s);
      let data: Array<DataItem> = ds.map(d => { d.LocationItem.Offline = (d.DevState == DeviceStatus.Offline); return d.LocationItem; });
      this.Resolve(data, callback, posiConvertor);
    });
  }
  // TODO to become a function of utility
  private Jsonp(url: string, data: any, callback: (data: string) => void) {
    jQuery.ajax(url, {
      type: 'GET', dataType: 'jsonp', data: data, success: callback, error: () => {
        console.log('err')
      }
    });
  }
  public GenerateUniqueKey(id: string, type: string) {
    return `${id}_${type}`;
  }
  public Resolve(datas: Array<DataItem>, callback: (gif: GraphicOutInfo, type: DeviceStatus, dataItem: DataItem) => void
    , posiConvertor?: (posi: [number, number]) => [number, number], dataFilter?: (dataItem: DataItem) => boolean) {
    for (let i = 0; i < datas.length; i++) {
      const data: DataItem = datas[i], now = new Date();
      if (data.X == 0 && data.Y == 0 || (dataFilter && !dataFilter(data))) { continue; }
      let profile: GraphicOutInfo, type: DeviceStatus;
      let ps: [number, number] = [data.X, data.Y];
      // ps = ol_proj.transform(ps, GetProjByEPSG(0), 'EPSG:3857')// 'EPSG:4326'
      if (posiConvertor) {
        ps = posiConvertor(ps);
      }
      ps = ol_proj.transform(ps, data.EPSG !== undefined ? GetProjByEPSG(data.EPSG) : this.ConfigurationService.MapConfig.srs, this.ConfigurationService.MapConfig.frontEndEpsg);

      if (!(profile = this.Obtain(data.UniqueId, data.Type))) {
        profile = {
          Type: data.Type, Id: data.UniqueId, Location: { x: ps[0], y: ps[1] }
          // 名称会在创建完后 由用户修改
          , Title: data.Name
          , Parent: null
          , ReveiveTime: now
        };
        this.Coms[Id_TypeGenerator(data.UniqueId, data.Type)] = profile;
        type = data.Offline ? DeviceStatus.NewOffline : DeviceStatus.New;
      } else {
        this.ComponentMove(data.UniqueId, data.Type, { x: ps[0], y: ps[1] });
        if (profile.Offline && !data.Offline) { type = DeviceStatus.Online; } else
          if (!profile.Offline && data.Offline) { type = DeviceStatus.Offline; } else { type = DeviceStatus.Move; }
      }
      profile.Floor = data.Floor;
      profile.Duration = data.Duration;
      profile.ReveiveTime = now;
      profile.Time = data.CollectTime;
      profile.Location = { x: ps[0], y: ps[1] };
      profile.Offline = data.Offline;
      profile.Direction = data.Direction;
      callback(profile, type, data);
      // callback 会为profile.subType 赋值
      if (type == DeviceStatus.New || type == DeviceStatus.NewOffline) {
        this.AddFeature(profile, true);
      } else {
        this.AddFeature(profile);
      }

      this.SetState(this.Events.DeviceUpdate, { data: profile, type: type });
      // if (type == DeviceStatus.New || type == DeviceStatus.NewOffline) {
      //   feature.setProperties({ name: profile.Title })
      //   feature.setProperties({ mainColor: profile.Color })
      // }
    }
  }
  //#endregion

  SetShowItem(filter: (graphic: GraphicOutInfo) => boolean) {// filter: Array<[string, boolean]> | ((graphic: GraphicOutInfo) => boolean)
    this.Filter = filter;
    for (let c in this.Coms) {
      let i: GraphicOutInfo = this.Coms[c];
      i.Visable = filter(i);
    }
    this.Layer.getSource().refresh();
    return this;
  }
  SendMsg(postData: Object): DeviceService {
    this.socket.SendMsg(postData);
    return this;
  }
  ProcessClose(): DeviceService {
    this.socket.Close();
    this.socket = undefined;
    return this;
  }
  EmptyComponents(): DeviceService {
    // for (let n in this.Coms) {
    //     let obj = this.Coms[n] as GraphicOutInfo
    //     if (obj.Title3D) GetScene().remove(obj.Title3D)
    //     GetScene().remove(obj.ThreeObject3D)
    //     delete this.Coms[n];
    // }
    return this;
  }

  public HighLight(com: GraphicOutInfo) {
    if (!com || this.HighlightedId) {
      delete this.HighlightedId;
    }
    this.HighlightedId = com ? com.Id : undefined;
  }
}
// export let GetDeviceService: () => DeviceService = Singleton(DeviceService, true);
