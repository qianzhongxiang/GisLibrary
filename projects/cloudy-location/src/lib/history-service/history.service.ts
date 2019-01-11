import { ConfigurationService } from './../configuration.service';
import { DataItem } from './../../utilities/entities';
import { Injectable } from '@angular/core';
import * as jQuery from 'jquery';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class HistoryService {
  private callbacks: Array<(data: Array<DataItem>) => void> = [];
  private routeCallbacks: Array<(data: Array<DataItem>) => void> = [];
  private currentUpdates: Array<(item: DataItem, index: number) => void> = [];
  private interval = 2000;
  private intervalFlag: number;
  public Data: Array<DataItem>;
  private currentIndex = 0;
  constructor(private configurationService: ConfigurationService,
    private httpClient: HttpClient) { }
  public Subscribe(callback?: (data: Array<DataItem>) => void
    , currentUpdate?: (item: DataItem, index: number) => void
    , routeCallback?: (data: Array<DataItem>) => void) {
    if (callback) { this.callbacks.push(callback); }
    if (currentUpdate) { this.currentUpdates.push(currentUpdate); }
    if (routeCallback) { this.routeCallbacks.push(routeCallback); }
  }
  public SetInterval(interval: number) {
    this.interval = interval;
  }
  public SetCurrentIndex(index: number) {
    this.currentIndex = index;
    this.currentUpdates.forEach(c => c(this.Data[index], index));
  }
  public Launch(index: number = this.currentIndex) {
    if (!this.Data) { return; }
    this.Stop();
    let i = index;
    this.intervalFlag = window.setInterval(() => {
      if (this.Data.length < (i + 1)) { return; }
      this.currentUpdates.forEach(c => c(this.Data[i], i));
      i++;
    }, this.interval);
  }
  public Stop() {
    if (this.intervalFlag) { window.clearInterval(this.intervalFlag); }
  }
  public Clean() {
    this.Stop();
    this.Data = [];
    this.currentIndex = 0;
  }
  /**
   * 获取历史数据 通过jsonp or access control
   * @param uid
   * @param type
   * @param sTime
   * @param eTime
   * @param callback
   * @param corsType
   * @param noInterval   dataItem 是否有Interval属性
   */
  public GetData(datas: Array<{ uid: string, type: string, sTime: string, eTime: string }>,
    callback?: (data: Array<DataItem>) => void, corsType: 'AccessControl' | 'jsonp' = 'jsonp', noInterval: boolean = false) {
    this.Clean();
    if (!datas.length) {
      return;
    }
    const url = this.configurationService.MapConfig.webService + `/HistoryGet`
      , index = 1, count = 200;
    let dataIndex = 0, beginTime: Date;

    // let postdata = { uid: uid, type: type, stime: sTime.toISOString(), etime: eTime.toISOString(), index: 1, count: 200 };
    let postdata = Object.assign(datas[dataIndex], { index: index, count: count, interval: 15 });
    // { uid: "352544071943238", type: "SF", stime: sTime.toISOString(), etime: eTime.toISOString(), index: 1, count: 200 };
    const cb = ((ds: string | Array<DataItem>) => {
      if (typeof ds === 'string') { ds = JSON.parse(ds) as Array<DataItem>; }
      ds = ds.sort((s1, s2) => {
        return s1.SendTime > s2.SendTime ? 1 : -1;
      });
      let oneMinData: DataItem[];
      if (noInterval) {
        oneMinData = ds.filter(d => {
          const t = new Date(d.SendTime);
          if (!beginTime || t.getTime() >= (beginTime.getTime() + 60000)) {
            beginTime = t;
            return true;
          }
        });
      } else {
        oneMinData = ds.filter(d => d.CustomInterval === 60);
      }
      this.Data = this.Data.concat(oneMinData);
      if (callback) { callback(oneMinData); }
      this.callbacks.forEach(c => c(oneMinData));
      this.routeCallbacks.forEach(c => c(ds as Array<DataItem>));
      if ((ds as Array<any>).length >= postdata.count) {
        postdata.index++;
        this.CorsRequest(corsType, url, postdata, cb, e => {
          console.log(e);
        });
      } else if (datas[++dataIndex]) {
        postdata = Object.assign(datas[dataIndex], { index: index, count: count, interval: 15 });
        this.CorsRequest(corsType, url, postdata, cb, e => {
          console.log(e);
        });
      }
    }).bind(this);
    this.CorsRequest(corsType, url, postdata, cb, e => {
      console.log(e);
    });
    // this.GetRouteData(datas)
    this.Launch();
  }
  private CorsRequest(corsType: 'AccessControl' | 'jsonp', url: string, data: any, callback: (data: Array<DataItem>) => void,
    erroCallback?: (e) => void) {
    switch (corsType) {
      case 'AccessControl':
        this.httpClient.post(url, data).subscribe(callback, erroCallback);
        break;
      case 'jsonp':
        this.Jsonp(`${url}?callback=?`, data, callback, erroCallback);
        break;
      default:
        break;
    }
  }
  private Jsonp(url: string, data: any, callback: (data: Array<DataItem>) => void, erroCallback?: (e) => void) {
    jQuery.ajax(url, {
      type: 'GET', dataType: 'jsonp', data: data, success: callback, error: (xhr, s, e) => {
        if (erroCallback) {
          erroCallback(e);
        }
      }
    });
  }
}
