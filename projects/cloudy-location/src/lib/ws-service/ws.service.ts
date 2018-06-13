import { MapConifg } from './../../utilities/config';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  constructor() { }
  public Init(config: MapConifg) { }

  public MqttSubscribe(topic: string, callback: (d: any) => void) {

  }
  public WsSubscribe(callback: (d: any) => void) {

  }
}
