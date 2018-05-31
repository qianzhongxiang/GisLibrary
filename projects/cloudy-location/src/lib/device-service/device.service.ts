import { BaseGraphic } from './../../graphic/BaseGraphic';
import { Injectable } from '@angular/core';
import { IncarGraphic } from './../../graphic/IncarGraphic';
import { GPSTagGraphic } from './../../graphic/GPSTagGraphic';
import { CellPhoneGraphic } from './../../graphic/CellPhoneGraphic';
import { GraphicOutInfo, GetGraphicFactory, Graphic } from "./../../graphic/Graphic";
import { GetConfigManager, IObseverable, ObserverableWMediator, LogHelper, WebSocketor } from 'vincijs';
import VertorSource from 'ol/source/Vector'
import VertorLayer from 'ol/layer/Vector'
import ol_proj from 'ol/proj'
import { GetProjByEPSG } from './../../utilities/olProjConvert';
import { DataItem } from './../../utilities/entities';
// import mqtt = require('mqtt')
import * as mqtt from 'mqtt'
import { MapConifg } from './../../utilities/config';

// import ol_style = require('ol/style/Style')
// import ol_stroke = require('ol/style/Stroke')

GetGraphicFactory().SetComponent(BaseGraphic);
GetGraphicFactory().SetComponent(CellPhoneGraphic);
GetGraphicFactory().SetComponent(GPSTagGraphic);
GetGraphicFactory().SetComponent(IncarGraphic);
export enum WSType {
  //None = 0,
  Location = 1,
  History = 10,
}
export interface RequestMsgObject {
  Type?: WSType
  Region?: string
  /**
   * svr default 3000
   */
  HistoryDuration?: number
  STime?: Date | string
  ETime?: Date | string
  UIds?: Array<string>
}
// interface DataItem {
//   X: number
//   Y: number
//   EPSG: number
//   Type: string
//   CollectTime: string
//   Name: string
//   UniqueId: string
//   Duration: number
// }
/**
 * manager dependent on TWEEN
 */
@Injectable()
export class DeviceService extends ObserverableWMediator {
  private socket: WebSocketor;
  private TIMEOUT: number = 600000 //10 minutes
  public Coms = {}; //{"{Id}":GraphicOutInfo}
  private VectorSource: ol.source.Vector
  private Layer: ol.layer.Vector
  public Events = { WSOpened: "WSOpened", WSClosed: "WSClosed", TweenStart: "TweenStart", DeviceUpdate: "DeviceUpdate" }
  private HighlightedId: string
  private autoReconnectInterval: number = 5000
  private duration: number = 5000
  public durTimes: number = 1
  private Filter: (graphic: GraphicOutInfo) => boolean
  private Config: MapConifg
  constructor() {
    super();
    this.VectorSource = new VertorSource();
    this.Layer = new VertorLayer({
      source: this.VectorSource, style: (feature) => {
        let f = (feature as ol.Feature), id = f.getId(), c = this.Coms[id]
        if (this.Filter && !c.Visable) { c.Visable = this.Filter(c) }
        let v = c ? c.Visable : false;
        let s = GetGraphicFactory().GetComponent(f.get("type")).GetStyle(f.get('mainColor'), f.get('name') || id, v);
        if (this.HighlightedId && this.HighlightedId == id) {
          let c = s.getImage() as ol.style.Circle
          c.getStroke().setColor('yellow');
          s.setZIndex(99);
          s.getText().setFont("Normal bold 18px Arial");
          s.getText().getStroke().setWidth(5)
          // s.getText().getStroke().setColor('red');
        }
        return s;
      }
    });
    this.Layer.setZIndex(80);
  }
  public Init(Config: MapConifg) {
    this.Config = Config
  }
  public GetLayer(): ol.layer.Vector {
    return this.Layer;
  }
  private ClearTimeOutComs() {
    // let now = new Date();
    // for (let n in this.Coms) {
    //     let obj = this.Coms[n] as GraphicOutInfo
    //     if ((now.getTime() - obj.ReveiveTime.getTime()) > this.TIMEOUT) { //因为小车也有时间 所以也会清除
    //         if (obj.Title3D) GetScene().remove(obj.Title3D)
    //         GetScene().remove(obj.ThreeObject3D)
    //         delete this.Coms[n];
    //     }
    // }
  }
  //#region data-item query operation
  /**
   * 获取GraphicOutInfo
   * @param Id
   */
  public Obtain(Id: string): GraphicOutInfo {
    return this.Coms[Id];
  }
  public GetPosition(Id: string): [number, number] {
    return (this.Layer.getSource().getFeatureById(Id).getGeometry() as ol.geom.Point).getCoordinates();
  }

  public Find(fn: (obj: GraphicOutInfo) => boolean): Array<GraphicOutInfo> {
    let res: Array<GraphicOutInfo> = []
    for (let n in this.Coms) {
      let obj = this.Coms[n] as GraphicOutInfo
      if (fn(obj)) res.push(obj)
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
  ComponentMove(id: string, loc: { x: number; y: number; }, duration: number): DeviceService { //TODO 若chain堆积太多 则必须对象位置需跳过前面tweens
    let that = this, graphic: GraphicOutInfo
    //TODO 判断位置如果相同不进行任何操作;
    if (graphic = this.Coms[id]) {
      let feature = this.VectorSource.getFeatureById(graphic.Id);
      (feature.getGeometry() as ol.geom.Point).setCoordinates([loc.x, loc.y])
      // ******TWEEN****************
      // if (!graphic.PArray) graphic.PArray = [];
      // graphic.PArray.push({ x: loc.x, y: loc.y, dur: duration, time: graphic.Time as string });
      // if (!that.LastTweens[graphic.Id]) {
      //     // LogHelper.Log("tween launch")
      //     that.LastTweens[graphic.Id] = this.Tween(graphic.Location, graphic).start();
      // }
    }
    else
      console.log("err: id:" + id + " 在Coms中不存在");
    return this;
  }
  /**
   * to launch procession to process data from coordinate websocket which can be closed by invoke "ProcessClose" method
   * @param callback
   * @param posiConvertor coordinate convertor
   */
  public DataProcess(callback: (gif: GraphicOutInfo, type: "new" | "move") => void
    , posiConvertor?: (posi: [number, number]) => [number, number]): DeviceService {
    let type = this.Config.wsType;
    let url = this.Config.locationSocketURI
    switch (type) {
      case "ws":
        if (this.socket) return this;
        this.socket = new WebSocketor({ Url: url });
        this.socket.Open(evt => {
          try {
            let datas = JSON.parse(evt.data);
            this.Resolve(datas, callback, posiConvertor)
          } catch (error) {
            LogHelper.Error(error)
          }
        }, () => {
          this.SetState(this.Events.WSOpened, this.socket);
        })
        break;
      case "mqtt":
        let topic = this.Config.mqttTopic
          , user = this.Config.mqttUser
          , pd = this.Config.mqttPd
          , client = mqtt.connect(url, { username: user, password: pd })
        // , client = mqtt.connect(undefined, { username: user, password: pd, hostname: "192.168.8.64", port: 61623 })
        console.log(url)
        console.log(user)
        console.log(pd)
        client.on('connect', () => {
          client.subscribe('presence')
          // client.publish('presence', 'Hello mqtt')
        })

        client.on('message', (topic, message) => {
          // message is Buffer
          var str = message.toString()
          // console.log(str)
          try {
            let datas = JSON.parse(str);
            this.Resolve([datas], callback, posiConvertor)
          } catch (error) {
            LogHelper.Error(error)
          }
        })
        client.subscribe(topic, { qos: 0 })
        break
    }

    return this;
  }
  public Resolve(datas: Array<DataItem>, callback: (gif: GraphicOutInfo, type: "new" | "move") => void
    , posiConvertor?: (posi: [number, number]) => [number, number]) {
    for (var i = 0; i < datas.length; i++) {
      let data: DataItem = datas[i], now = new Date();
      if (data.X == 0 && data.Y == 0) continue;
      let graphic = GetGraphicFactory().GetComponent(data.Type);
      let profile: GraphicOutInfo, type: "new" | "move"
      let ps: [number, number] = [data.X, data.Y];
      // ps = coordtransform.wgs84togcj02(ps[0], ps[1]) as [number, number]
      ps = ol_proj.transform(ps, GetProjByEPSG(data.EPSG || 0), 'EPSG:3857')// 'EPSG:4326'
      if (posiConvertor)
        ps = posiConvertor(ps);
      let feature: ol.Feature
      if (!this.Coms[data.UniqueId]) {
        profile = {
          type: data.Type, Graphic: graphic, Id: data.UniqueId, Location: { x: ps[0], y: ps[1] }
          , Parent: null
          , Title: data.Name
          , ReveiveTime: now
        }
        feature = graphic.Buid(ps);
        feature.setId(profile.Id);
        this.VectorSource.addFeature(feature);
        this.Coms[data.UniqueId] = profile;
        type = "new";
      } else {
        profile = this.Coms[data.UniqueId];
        this.ComponentMove(data.UniqueId, { x: ps[0], y: ps[1] }, data.Duration);
        type = "move";
      }
      profile.Duration = data.Duration;
      profile.ReveiveTime = now;
      profile.Time = data.CollectTime;
      profile.Location = { x: ps[0], y: ps[1] }
      callback(profile, type);
      this.SetState(this.Events.DeviceUpdate, { data: profile, type: type })
      if (type == 'new') {
        feature.setProperties({ name: profile.Title })
        feature.setProperties({ mainColor: profile.Color })
      }
    }
  }
  //#endregion

  SetShowItem(filter: (graphic: GraphicOutInfo) => boolean) {//filter: Array<[string, boolean]> | ((graphic: GraphicOutInfo) => boolean)
    // if (filter instanceof Array) {
    //   filter.forEach(t => {
    //     GetGraphicFactory().GetComponent(t[0]).Visable = t[1];
    //     //this.VectorSource.getFeatureById(t[0]).set("visible",t[1]);
    //   })
    // }
    // else {
    this.Filter = filter;
    for (let c in this.Coms) {
      let i: GraphicOutInfo = this.Coms[c];
      i.Visable = filter(i);
    }
    // }
    //update
    this.Layer.getSource().refresh();
    return this;
  }
  SendMsg(postData: Object): DeviceService {
    this.socket.SendMsg(postData);
    return this;
  }
  ProcessClose(onclose?: () => void): DeviceService {
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
      delete this.HighlightedId
    }
    this.HighlightedId = com ? com.Id : undefined;
  }
}
// export let GetDeviceService: () => DeviceService = Singleton(DeviceService, true);
