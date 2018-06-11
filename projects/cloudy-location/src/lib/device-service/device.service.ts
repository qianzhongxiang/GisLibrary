import { Messaging } from './../../utilities/mqttws31';
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
import { DataItem, MsgEntity } from './../../utilities/entities';
import * as mqtt from 'mqtt'
import { MapConifg } from './../../utilities/config';
import * as jQuery from 'jquery'
import { DeviceStatus } from '../../utilities/enum';
import { BaseMaterial } from '../../graphic/BaseMaterial';
// import ol_style = require('ol/style/Style')
// import ol_stroke = require('ol/style/Stroke')



/**
 * manager dependent on TWEEN
 */
@Injectable()
export class DeviceService extends ObserverableWMediator {
  private socket: WebSocketor;
  public Coms: { [key: string]: GraphicOutInfo } = {};
  private VectorSource: ol.source.Vector
  private Layer: ol.layer.Vector
  public Events = { WSOpened: "WSOpened", WSClosed: "WSClosed", TweenStart: "TweenStart", DeviceUpdate: "DeviceUpdate", MsgChange: "MsgChange" }
  private HighlightedId: string
  private autoReconnectInterval: number = 5000
  private duration: number = 5000
  public durTimes: number = 1
  private Filter: (graphic: GraphicOutInfo) => boolean
  private Config: MapConifg
  private Offlines: Array<{ id: string, type: string }>
  constructor() {
    super();
    GetGraphicFactory().SetComponent(BaseGraphic, 'base');
    GetGraphicFactory().SetComponent(CellPhoneGraphic, 'cellphone');
    GetGraphicFactory().SetComponent(GPSTagGraphic, 'gpstag');
    GetGraphicFactory().SetComponent(IncarGraphic, 'incar');
    this.VectorSource = new VertorSource();
    this.Layer = new VertorLayer({
      source: this.VectorSource, style: (feature) => {
        let f = (feature as ol.Feature), id = f.getId(), type = f.get("type"), c = this.Coms[id]
        if (this.Filter && !c.Visable) { c.Visable = this.Filter(c) }
        let v = c ? c.Visable : false;
        let s = GetGraphicFactory().GetComponent(type).GetStyle(f.get('mainColor'), f.get('name') || id, v);
        if (this.HighlightedId && this.HighlightedId == id) {
          let c = s.getImage() as ol.style.Circle
          c.getStroke().setColor('yellow');
          s.setZIndex(99);
          s.getText().setFont("Normal bold 18px Arial");
          s.getText().getStroke().setWidth(5)
          // s.getText().getStroke().setColor('red');
        }
        if (c && c.Offline) {
          let c = s.setImage(BaseMaterial.GetCircleImage());
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
  public DataProcess(callback: (gif: GraphicOutInfo, type: DeviceStatus) => void
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
        let msgWS = new WebSocketor({ Url: "ws://223.68.186.220:3723" });
        msgWS.Open(evt => {
          try {
            let datas = JSON.parse(evt.data);
            let array = datas as Array<MsgEntity>
            array.forEach(i => {
              let item = this.Coms[i.Uid];
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
        })
        break;
      case "mqtt":
        let t = this.Config.mqttTopic,
          devMsg = 'devMsg'
          , user = this.Config.mqttUser
          , pd = this.Config.mqttPd
          , client = mqtt.connect(url, { username: user, password: pd })

        // let array = url.split(":")
        // let mqClient = new Messaging.Client(url.replace(":" + array[2], ""), Number(array[2]), "locFrontEnd");
        // mqClient.onConnectionLost = (responseObject) => {
        //   if (responseObject.errorCode !== 0) {
        //     console.log("onConnectionLost:" + responseObject.errorMessage);
        //     mqClient.connect({
        //       password: pd,
        //       userName: user,
        //       onSuccess: () => {
        //         // Once a connection has been made, make a subscription and send a message.
        //         console.log("onConnect");
        //         mqClient.subscribe(t)
        //         mqClient.subscribe(devMsg)
        //       }
        //     });
        //   }
        // };
        // mqClient.onMessageArrived = (message) => {
        //   console.log("onMessageArrived:" + message.payloadString);
        //   let str = message.payloadString;
        //   let topic = message.destinationName;
        //   try {
        //     let datas = JSON.parse(str);
        //     switch (topic) {
        //       case t:
        //         LogHelper.Log(str);
        //         this.Resolve([datas], callback, posiConvertor)
        //         break;
        //       case devMsg:
        //         let array = datas as Array<MsgEntity>
        //         array.forEach(i => {
        //           let item = this.Coms[i.Uid];
        //           if (item && !item.Offline) {
        //             item.Offline = true;
        //             callback(item, DeviceStatus.Offline)
        //             this.SetState(this.Events.DeviceUpdate, { data: item, type: DeviceStatus.Offline })
        //           }
        //         })
        //         this.VectorSource.refresh();
        //         // this.SetState(this.Events.MsgChange, array)
        //         break;
        //     }
        //   } catch (error) {
        //     LogHelper.Error(error)
        //   }
        //   // mqClient.disconnect();
        // };

        // mqClient.connect({
        //   password: pd,
        //   userName: user,
        //   onSuccess: () => {
        //     // Once a connection has been made, make a subscription and send a message.
        //     mqClient.subscribe(t)
        //     mqClient.subscribe(devMsg)
        //   }
        // });


        client.on('connect', () => {
          client.subscribe(t)
          client.subscribe(devMsg)
          // client.publish('presence', 'Hello mqtt')
        })

        client.on('message', (topic, message) => {
          // message is Buffer
          var str = message.toString()
          // console.log(str)
          try {
            let datas = JSON.parse(str);
            switch (topic) {
              case t:
                this.Resolve([datas], callback, posiConvertor)
                break;
              case devMsg:
                let array = datas as Array<MsgEntity>
                array.forEach(i => {
                  let item = this.Coms[i.Uid];
                  if (item) item.Offline = true;
                })
                this.SetState(this.Events.MsgChange, array)
                break;
            }
          } catch (error) {
            LogHelper.Error(error)
          }
        })
        client.subscribe(t, { qos: 0 })
        break
    }
    return this;
  }
  /**
   * 
   * @param items {id}_{type},{id}_{type}
   * @param callback 
   * @param posiConvertor 
   */
  public DevPositionInit(items: string, callback: (gif: GraphicOutInfo, type: DeviceStatus) => void
    , posiConvertor?: (posi: [number, number]) => [number, number]) {
    let url = this.Config.webService + `/DeviceProfileGet?callback=?`
    this.Jsonp(url, { items: items }, (s) => {
      if (!s) return;
      let ds: Array<{ DevState: number, LocationItem: DataItem }> = JSON.parse(s);
      let data: Array<DataItem> = ds.map(d => { d.LocationItem.Offline = (d.DevState == DeviceStatus.Offline); return d.LocationItem; });
      this.Resolve(data, callback, posiConvertor);
    });
  }
  //TODO to become a function of utility
  private Jsonp(url: string, data: any, callback: (data: string) => void) {
    jQuery.ajax(url, {
      type: "GET", dataType: "jsonp", data: data, success: callback, error: (xhr, s, e) => {
        console.log("err")
      }
    })
  }
  public GenerateUniqueKey(id: string, type: string) {
    return `${id}_${type}`;
  }
  public Resolve(datas: Array<DataItem>, callback: (gif: GraphicOutInfo, type: DeviceStatus) => void
    , posiConvertor?: (posi: [number, number]) => [number, number]) {
    for (var i = 0; i < datas.length; i++) {
      let data: DataItem = datas[i], now = new Date();
      if (data.X == 0 && data.Y == 0) continue;
      let graphic = GetGraphicFactory().GetComponent(data.Type);
      let profile: GraphicOutInfo, type: DeviceStatus
      let ps: [number, number] = [data.X, data.Y];
      // ps = ol_proj.transform(ps, GetProjByEPSG(0), 'EPSG:3857')// 'EPSG:4326'
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
        type = data.Offline ? DeviceStatus.NewOffline : DeviceStatus.New;
      } else {
        profile = this.Coms[data.UniqueId];
        this.ComponentMove(data.UniqueId, { x: ps[0], y: ps[1] }, data.Duration);
        if (profile.Offline && !data.Offline) type = DeviceStatus.Online;
        else if (!profile.Offline && data.Offline) type = DeviceStatus.Offline;
        else type = DeviceStatus.Move
      }
      profile.Duration = data.Duration;
      profile.ReveiveTime = now;
      profile.Time = data.CollectTime;
      profile.Location = { x: ps[0], y: ps[1] }
      profile.Offline = data.Offline;
      callback(profile, type);
      this.SetState(this.Events.DeviceUpdate, { data: profile, type: type })
      if (type == DeviceStatus.New) {
        feature.setProperties({ name: profile.Title })
        feature.setProperties({ mainColor: profile.Color })
      }
    }
  }
  //#endregion

  SetShowItem(filter: (graphic: GraphicOutInfo) => boolean) {//filter: Array<[string, boolean]> | ((graphic: GraphicOutInfo) => boolean)
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
