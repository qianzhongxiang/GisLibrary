import { OlMapService } from './../map-service/ol-map.service';
import { DeviceService } from './../device-service/device.service';
import { Component, OnInit, ViewChild, ElementRef, Optional, AfterViewInit } from '@angular/core';
import { AssetService } from '../asset-service/asset.service';
import { RequestMsgObject } from './../../utilities/entities';

@Component({
  selector: 'cl-map',
  template: '<div #div class="mapContainer" style="height:100%;"></div>',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    this.OlMapService.Show({ target: this.container.nativeElement })
  }
  @ViewChild("div") container: ElementRef
  constructor(private OlMapService: OlMapService, private DeviceService: DeviceService, private AssetService: AssetService) { }
  public DeviceInit() {
    if (this.DeviceService) {
      this.OlMapService.AddLayer(this.DeviceService.GetLayer());
      this.DeviceService.Bind(this.DeviceService.Events.WSOpened, this.InitWSType.bind(this))
      this.DeviceService.DataProcess((gif, type) => {
        if (type == "new") {
          let info = this.AssetService ? this.AssetService.Get(gif.Id, gif.type) : undefined;
          if (!info) gif.Title = gif.Id;
          else {
            gif.Title = info.Title;
            gif.Color = info.Color;
          }
        }
        else if (type == "move") {

        }
        // this.Business.Update(type, gif);
      })
    }
  }
  ngOnInit() {
  }

  public SendMsg(obj: RequestMsgObject) {
    if (obj)
      this.DeviceService.SendMsg(obj);
  }
  protected InitWSType() {
    //TODO InitWSParameters
    this.SendMsg({ Type: 1 });
  }
}
