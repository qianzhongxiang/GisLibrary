import { DeviceService } from './../device-service/device.service';
import { MapConifg } from './../../utilities/config';
import { DataItem } from './../../utilities/entities';
import { Injectable } from '@angular/core';
import * as jQuery from 'jquery'
@Injectable()
export class HistoryService {
  private callbacks: Array<(data: Array<DataItem>) => void> = []
  private routeCallbacks: Array<(data: Array<DataItem>) => void> = []
  private currentUpdates: Array<(item: DataItem, index: number) => void> = []
  private interval: number = 2000;
  private intervalFlag: number
  public Data: Array<DataItem>
  private currentIndex: number = 0
  private Config: MapConifg
  constructor() { }
  public Init(config: MapConifg) {
    this.Config = config;
  }
  public Subscribe(callback?: (data: Array<DataItem>) => void
    , currentUpdate?: (item: DataItem, index: number) => void
    , routeCallback?: (data: Array<DataItem>) => void) {
    if (callback) this.callbacks.push(callback);
    if (currentUpdate) this.currentUpdates.push(currentUpdate);
    if (routeCallback) this.routeCallbacks.push(routeCallback);
  }
  public SetInterval(interval: number) {
    this.interval = interval;
  }
  public SetCurrentIndex(index: number) {
    this.currentIndex = index;
    this.currentUpdates.forEach(c => c(this.Data[index], index));
  }
  public Launch(index: number = this.currentIndex) {
    if (!this.Data) return;
    this.Stop();
    let i = index;
    this.intervalFlag = window.setInterval(() => {
      if (this.Data.length < (i + 1)) return;
      this.currentUpdates.forEach(c => c(this.Data[i], i));
      i++;
    }, this.interval);
  }
  public Stop() {
    if (this.intervalFlag) window.clearInterval(this.intervalFlag);
  }
  public Clean() {
    this.Stop();
    this.Data = [];
    this.currentIndex = 0;
  }
  /**
   * 获取历史数据 通过jsonp
   * @param uid 
   * @param type 
   * @param sTime 
   * @param eTime 
   * @param callback 
   */
  public GetData(datas: Array<{ uid: string, type: string, sTime: string, eTime: string }>, callback?: (data: Array<DataItem>) => void) {
    this.Clean()
    let res: Location, url = this.Config.webService + `/HistoryGet?callback=?`
      , dataIndex = 0, index = 1, count = 200;

    // let postdata = { uid: uid, type: type, stime: sTime.toISOString(), etime: eTime.toISOString(), index: 1, count: 200 };
    let postdata = Object.assign(datas[dataIndex], { index: index, count: count, interval: 15 });// { uid: "352544071943238", type: "SF", stime: sTime.toISOString(), etime: eTime.toISOString(), index: 1, count: 200 };
    let cb = ((ds: string | Array<DataItem>) => {
      if (typeof ds === "string") ds = JSON.parse(ds) as Array<DataItem>;
      let oneMinData = ds.filter(d => d.CustomInterval == 60)
      this.Data = this.Data.concat(oneMinData);
      if (callback) callback(oneMinData);
      this.callbacks.forEach(c => c(oneMinData));
      this.routeCallbacks.forEach(c => c(ds as Array<DataItem>));
      if ((ds as Array<any>).length >= postdata.count) {
        postdata.index++;
        this.Jsonp(url, postdata, cb)
      } else if (datas[++dataIndex]) {
        postdata = Object.assign(datas[dataIndex], { index: index, count: count, interval: 15 });
        this.Jsonp(url, postdata, cb)
      }
    }).bind(this);
    this.Jsonp(url, postdata, cb)
    // this.GetRouteData(datas)
    this.Launch();
  }
  private Jsonp(url: string, data: any, callback: (data: Array<DataItem>) => void) {
    jQuery.ajax(url, {
      type: "GET", dataType: "jsonp", data: data, success: callback, error: (xhr, s, e) => {
        console.log("err")
      }
    })
  }
}
