import { WarningEntity } from './../../utilities/entities';
import { Injectable } from '@angular/core';
import { WebSocketor, LogHelper } from 'vincijs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }
  private WarningService: string
  private WarningWsType: string
  Msgs: Array<{ msg: string, data: WarningEntity }> = []
  public Init(warningService: string, warningWsType: string = 'mqtt') {
    this.WarningService = warningService;
    this.WarningWsType = warningWsType;
  }
  public MsgFormat(warnningName: string, assetName: string) {
    return `${warnningName}:${assetName} --${new Date().toLocaleTimeString()}`
  }

  public PushMsg(msg: { msg: string, data: WarningEntity }) {
    this.Msgs.unshift(msg)
    if (this.Msgs.length > 20)
      this.Msgs.pop()
  }
  public Run(callback: (item: WarningEntity) => true) {
    if (this.WarningService) {
      switch ((this.WarningWsType || 'mqtt').toLowerCase()) {
        case 'ws':
          new WebSocketor({ Url: this.WarningService }).Open(evt => {
            let datas: Array<WarningEntity> = JSON.parse(evt.data);
            datas.forEach(d => {
              // callback()
              if (callback) {


              }
              // d.WarningType.Name, i.Title
              //   this.PushMsg({});
            })
          })
          break;
        case 'mqtt':

          break;
      }

    }
  }
}
