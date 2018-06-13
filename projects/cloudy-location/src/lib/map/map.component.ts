import { LogHelper } from 'vincijs';
import { Ajax } from 'vincijs';
import { OlMapService } from './../map-service/ol-map.service';
import { DeviceService } from './../device-service/device.service';
import { Component, OnInit, ViewChild, ElementRef, Optional, AfterViewInit, Input } from '@angular/core';
import { AssetService } from '../asset-service/asset.service';
import { RequestMsgObject } from './../../utilities/entities';
import { DeviceStatus } from '../../utilities/enum';

@Component({
  selector: 'cl-map',
  template: '<div #div class="mapContainer" style="height:100%;"></div>',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild("div") container: ElementRef
  @Input()
  public DeviceLay: boolean
  @Input()
  public DeviceReceive: boolean
  @Input()
  public InfoUrl: string
  ngAfterViewInit(): void {
    this.OlMapService.Show({ target: this.container.nativeElement })
    if (this.DeviceService) {
      if (this.DeviceReceive) {
        let layer = this.DeviceService.GetLayer();
        this.OlMapService.AddLayer(layer);
        this.DeviceService.Bind(this.DeviceService.Events.WSOpened, this.InitWSType.bind(this))
        this.DevPositionInit();
        this.DeviceService.DataProcess(this.DataProcessCallback.bind(this))
        this.OlMapService.AddPopup(f => {
          let id = f.getId(), type = f.get("type")
          // return `${id}_${type}`;
          let str = "";
          if (!this.InfoUrl) {
            return "err: InfoUrl is not decleared";
          }
          try {
            new Ajax({ url: this.InfoUrl, data: { uid: id, type: type }, contentType: "json", async: false })
              .done(d => {
                if (d.IsSuccess && d.Data) {
                  let array = d.Data as Array<string>;
                  str = `<div><p>${array.join("</br>")}</p></div>`
                }
              })
          }
          catch (e) {
            LogHelper.Error(e)
          }
          return str;
        }, layer);
      } else if (this.DeviceLay) {
        this.OlMapService.AddLayer(this.DeviceService.GetLayer());
      }
    }

  }
  private ShowPopup() {

  }
  constructor(private OlMapService: OlMapService, @Optional() private DeviceService: DeviceService, @Optional() private AssetService: AssetService) { }
  // public DeviceInit() {
  //   if (this.DeviceService) {
  //     this.OlMapService.AddLayer(this.DeviceService.GetLayer());
  //     this.DeviceService.Bind(this.DeviceService.Events.WSOpened, this.InitWSType.bind(this))
  //     this.DevPositionInit();
  //     this.DeviceService.DataProcess(this.DataProcessCallback.bind(this))
  //   }
  // }
  private DataProcessCallback(gif, type: DeviceStatus) {
    switch (type) {
      case DeviceStatus.NewOffline:
      case DeviceStatus.New:
        let info = this.AssetService ? this.AssetService.Get(gif.Id, gif.type) : undefined;
        if (!info) gif.Title = gif.Id;
        else {
          gif.Title = info.Title;
          gif.Color = info.Color;
        }
        break;
      case DeviceStatus.Online:
        break;
      case DeviceStatus.Offline:
        break;
    }
  }
  ngOnInit() {
  }

  // public SendMsg(obj: RequestMsgObject) {
  //   if (obj)
  //     this.DeviceService.SendMsg(obj);
  // }
  protected InitWSType() {
    // //TODO InitWSParameters
    // this.SendMsg({ Type: 1 });
  }
  private DevPositionInit() {
    let as = this.AssetService.GetAssets().map(a => a.Id_Type);
    this.DeviceService.DevPositionInit(as.join(","), this.DataProcessCallback.bind(this))
  }
}
