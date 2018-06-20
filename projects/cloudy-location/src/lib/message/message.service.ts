import { WsService } from './../ws-service/ws.service';
import { MsgEntity } from './../../utilities/entities';
import { Injectable } from '@angular/core';
import { WebSocketor, LogHelper } from 'vincijs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private WsService: WsService) { }
  private WarningService: string
  private WarningWsType: string
  private User: string
  private Pd: string
  Msgs: Array<{ msg: string, data: MsgEntity }> = []
  public Init(warningService: string, warningWsType: string = 'mqtt', user?: string, pd?: string) {
    this.WarningService = warningService;
    this.WarningWsType = warningWsType;
    this.User = user;
    this.Pd = pd;
  }
  public MsgFormat(warnningName: string, assetName: string) {
    return `${warnningName}:${assetName} --${new Date().toLocaleTimeString()}`
  }

  public PushMsg(msg: { msg: string, data: MsgEntity }) {
    this.Msgs.unshift(msg)
    if (this.Msgs.length > 20)
      this.Msgs.pop()
  }
  public Run(callback: (item: MsgEntity) => string) {
    if (this.WarningService) {
      switch ((this.WarningWsType || 'mqtt').toLowerCase()) {
        case 'ws':
          this.WsService.BasicWs(this.WarningService).Subscribe("",
            str => {
              let datas: Array<MsgEntity> = JSON.parse(str);
              datas.forEach(d => {
                this.PushMsg({ msg: callback(d), data: d });
              })
            })

          break;
        case 'mqtt':
          this.WsService.Mqtt(this.WarningService, this.User, this.Pd).Subscribe('msg', (payload) => {
            let d = JSON.parse(payload);
            this.PushMsg({ msg: callback(d), data: d });
          })
          break;
      }

    }
  }
}
