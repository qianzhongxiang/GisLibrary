import { ConfigurationService } from './../configuration.service';
import { GraphicOutInfo } from './../../graphic/graphics';
import { LogHelper } from 'vincijs';
import { Ajax } from 'vincijs';
import { OlMapService } from './../map-service/ol-map.service';
import { DeviceService } from './../device-service/device.service';
import { Component, OnInit, ViewChild, ElementRef, Optional, AfterViewInit, Input } from '@angular/core';
import { AssetService } from '../asset-service/asset.service';
import { RequestMsgObject } from './../../utilities/entities';
import { DeviceStatus } from '../../utilities/enum';
import ZoomSlider from 'ol/control/ZoomSlider';
import Zoom from 'ol/control/Zoom';
@Component({
  selector: 'cl-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('div') container: ElementRef;
  @Input()
  public DeviceLay: boolean;
  @Input()
  public DeviceReceive: boolean;
  @Input()
  /** be defined as url if Popup is set a string */
  public Popup: ((id: string, type: string) => string) | string | Array<string>;
  @Input()
  public AssetClick: (id: string, type: string) => void;

  @Input('zoomslider')
  public Zoomslider: boolean;

  ngAfterViewInit(): void {
    this.OlMapService.Show({ target: this.container.nativeElement });
    if (this.DeviceService) {
      const layer = this.DeviceService.GetLayer();
      if (this.DeviceReceive) {
        this.OlMapService.AddLayer(layer, true);
        this.DeviceService.Bind(this.DeviceService.Events.WSOpened, this.InitWSType.bind(this));
        this.DevPositionInit();
        this.DeviceService.DataProcess(this.DataProcessCallback.bind(this));
      } else if (this.DeviceLay) {
        this.OlMapService.AddLayer(layer, true);
      }
      if (this.Popup) {
        this.ShowPopup(layer);
      }
      if (this.AssetClick) {
        this.OlMapService.SelectInLayer([layer], (fs) => {
          const f = fs[0];
          if (!f) { return; }
          const id = f.getId() as string, type = f.get('type');
          this.AssetClick(id, type);
        }, true, false);
      }
    }
    this.InitZoomslider();
  }
  private InitZoomslider() {
    if (this.Zoomslider) {
      this.OlMapService.AddControl(new Zoom());
      this.OlMapService.AddControl(new ZoomSlider({}));
    }
  }
  private ShowPopup(layer) {
    this.OlMapService.AddPopup(f => {
      const id = f.getId() as string, type = f.get('type');
      // return `${id}_${type}`;
      let str = '';
      if (typeof this.Popup === 'string') {
        try {
          new Ajax({ url: this.Popup, data: { uid: id, type: type }, contentType: 'json', async: false })
            .done(d => {
              if (d.IsSuccess && d.Data) {
                const array = d.Data as Array<string>;
                str = `<div><p>${array.join('</br>')}</p></div>`;
              }
            });
        } catch (e) {
          LogHelper.Error(e);
        }
      } else if (typeof this.Popup === 'function') {
        str = this.Popup(id, type);
      } else if (this.Popup instanceof Array) {
        str = `<div><p>${this.Popup.join('</br>')}</p></div>`;
      }
      return str;
    }, layer);
  }
  constructor(public ConfigurationService: ConfigurationService, private OlMapService: OlMapService
    , @Optional() private DeviceService: DeviceService, @Optional() private AssetService: AssetService) { }

  private DataProcessCallback(gif: GraphicOutInfo, type: DeviceStatus) {
    switch (type) {
      case DeviceStatus.NewOffline:
      case DeviceStatus.New:
        const info = this.AssetService ? this.AssetService.Get(gif.Id, gif.Type) : undefined;
        if (!info) {
          gif.Title = gif.Id;
        } else {
          gif.Title = info.Title;
          gif.Color = info.Color;
          gif.SubType = info.Category;
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
    this.DeviceService.DevPositionInit(as.join(','), this.DataProcessCallback.bind(this));
  }
  // public GetSlider(): HTMLElement {
  //   let slider = (this.container.nativeElement as HTMLDivElement).getElementsByClassName("ol-zoomslider")[0]
  //   return slider as HTMLElement;
  // }
}
