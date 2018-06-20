import { MapConifg } from './../../utilities/config';
import { Injectable } from '@angular/core';
import * as mqtt from 'mqtt'
import { Packet } from 'mqtt';
import { WebSocketor } from 'vincijs';
export interface ITransService { }


export interface IMqttService extends ITransService {
  Subscribe(topic: string, callback: (payload: string) => void): void
}
export interface IBasicWsService extends ITransService {
  Subscribe(topic: string, callback: (d: string) => void): void

}
@Injectable({
  providedIn: 'root'
})
export class WsService {
  private MqttStorage: { [key: string]: IMqttService } = {}
  private BasicWsStorage: { [key: string]: IBasicWsService } = {}
  constructor() { }
  public Mqtt(url: string, user?: string, pd?: string): IMqttService {
    return this.MqttStorage[url.toLowerCase()] || (this.MqttStorage[url.toLowerCase()] = new MqttService(url, user, pd))
  }

  public BasicWs(url: string, user?: string, pd?: string): IBasicWsService {
    return this.MqttStorage[url.toLowerCase()] || (this.MqttStorage[url.toLowerCase()] = new MqttService(url, user, pd))
  }
}

class MqttService implements IMqttService {
  private mqtt: mqtt.Client
  private callbacks: { [key: string]: Array<(payload: string) => void> } = {}
  Subscribe(topic: string | string[], callback: (payload: string) => void): void {
    if (typeof topic === 'string') {
      if (!this.callbacks[topic])
        this.callbacks[topic] = [callback]
      else this.callbacks[topic].push(callback)
    } else {
      topic.forEach(t => {
        if (!this.callbacks[t])
          this.callbacks[t] = [callback]
        else this.callbacks[t].push(callback)
      })
    }
    this.mqtt.subscribe(topic, (e) => { })
  }
  constructor(url: string, user?: string, pd?: string) {
    this.mqtt = mqtt.connect(url, { username: user, password: pd }).on("message", (topic: string, payload: Buffer, packet: Packet) => {
      let cds = this.callbacks[topic];
      if (cds) {
        let s = payload.toString();
        cds.forEach(c => c(s))
      }
    })
  }
}

class BasicWsService implements IBasicWsService {
  private client: WebSocketor
  private callbacks: Array<(d: string) => void> = []
  Subscribe(topic: string, callback: (d: string) => void): void {
    this.callbacks.push(callback)
  }
  constructor(url: string, user?: string, pd?: string) {
    this.client = new WebSocketor({ Url: url });
    this.client.Open(evt => {
      this.callbacks.forEach(c => c(evt.data));
    }, () => {

    })
  }
}