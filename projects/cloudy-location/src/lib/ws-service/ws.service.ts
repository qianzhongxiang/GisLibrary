import { MapConifg } from './../../utilities/config';
import { Injectable } from '@angular/core';
import * as mqtt from 'mqtt';
import { WebSocketor } from 'vincijs';
export interface ITransService {
  OnConnected(callback: () => void): ITransService;
  OnDisConnected(callback: () => void): ITransService;
}


export interface IMqttService extends ITransService {
  Subscribe(topic: string | string[], callback: (payload: string) => void): IMqttService;
}
export interface IBasicWsService extends ITransService {
  Subscribe(topic: string | string[], callback: (payload: string) => void): IBasicWsService;

}
@Injectable({
  providedIn: 'root'
})
export class WsService {
  private MqttStorage: { [key: string]: IMqttService } = {};
  private BasicWsStorage: { [key: string]: IBasicWsService } = {};

  constructor() { }
  public Mqtt(url: string, user?: string, pd?: string): IMqttService {
    return this.MqttStorage[url.toLowerCase()] || (this.MqttStorage[url.toLowerCase()] =
      new MqttService(url, user, pd));
  }

  public BasicWs(url: string, user?: string, pd?: string): IBasicWsService {
    return this.MqttStorage[url.toLowerCase()] || (this.MqttStorage[url.toLowerCase()] =
      new MqttService(url, user, pd));
  }
}

class MqttService implements IMqttService {
  private mqtt: mqtt.Client;
  private callbacks: { [key: string]: Array<(payload: string) => void> } = {};
  OnConnected(callback: () => void): ITransService {
    this.mqtt.on('connect', callback);
    return this;
  }
  OnDisConnected(callback: () => void): ITransService {
    this.mqtt.on('error', callback);
    return this;
  }
  /**
   * qos be set to 1 by default
   * @param topic
   * @param callback
   */
  Subscribe(topic: string | string[], callback: (payload: string) => void): IMqttService {
    if (typeof topic === 'string') {
      if (!this.callbacks[topic]) {
        this.callbacks[topic] = [callback];
      } else { this.callbacks[topic].push(callback); }
    } else {
      topic.forEach(t => {
        if (!this.callbacks[t]) {
          this.callbacks[t] = [callback];
        } else { this.callbacks[t].push(callback); }
      });
    }
    this.mqtt.subscribe(topic, { qos: 1 }, (e) => { });
    return this;
  }
  constructor(url: string, user?: string, pd?: string) {
    this.mqtt = mqtt.connect(url, { username: user, password: pd, })
      .on('message', (topic: string, payload: Buffer, packet: mqtt.Packet) => {
        const cds = this.callbacks[topic];
        if (cds) {
          const s = payload.toString();
          cds.forEach(c => c(s));
        }
      });
  }
}

class BasicWsService implements IBasicWsService {
  private client: WebSocketor;
  private callbacks: Array<(d: string) => void> = [];
  OnConnected(callback: () => void): ITransService {
    throw new Error('Method not implemented.');
  }
  OnDisConnected(callback: () => void): ITransService {
    throw new Error('Method not implemented.');
  }

  Subscribe(topic: string, callback: (d: string) => void): IBasicWsService {
    this.callbacks.push(callback);
    return this;
  }
  constructor(url: string, user?: string, pd?: string) {
    this.client = new WebSocketor({ Url: url });
    this.client.Open(evt => {
      this.callbacks.forEach(c => c(evt.data));
    }, () => {

    });
  }
}
