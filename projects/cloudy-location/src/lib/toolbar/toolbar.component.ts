import { OfflineAssetComponent } from './../offline-asset/offline-asset.component';
import { AssetService } from './../asset-service/asset.service';
import { DeviceStatus } from './../../utilities/enum';
import { ToolbarConfig, ICate, OffLines } from './../../utilities/entities';
import { GraphicOutInfo } from './../../graphic/graphics';
import { DeviceService } from './../device-service/device.service';
import { Component, OnInit, Inject, Input, AfterViewInit } from '@angular/core';
import { Extend, IsMobile } from 'vincijs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'cl-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  SettingModalRef: any;
  private offline: ICate
  public mobile: boolean = IsMobile.any() ? true : false
  ngAfterViewInit(): void {
    setInterval(() => { this.Timer = new Date().toLocaleTimeString() }, 1000)
    this.Cates = [...this.Config.items,
    this.offline = { title: "离线", code: "offline", visable: true, count: this.AssetService.GetAssets().length, color: "gray", mp: false, class: '' }
    ];
    this.CatesDetailed = this.Config.itemsDetailed
    this.MainPageCates = this.Cates.filter(c => c.mp).concat(this.CatesDetailed.filter(c => c.mp));
    if (this.DeviceService) {
      this.DeviceService.Bind(this.DeviceService.Events.DeviceUpdate, (msg) => {
        var value: { data: GraphicOutInfo, type: DeviceStatus } = msg.Value
        if (!this.AssetService || !this.AssetService.Get(value.data.Id, value.data.Type)) return;
        switch (value.type) {
          case DeviceStatus.New:
            this.ChangeCount(value.data.Id, value.data.Type, 1)
            this.offline.count--;
            break;
          case DeviceStatus.Online:
            this.ChangeCount(value.data.Id, value.data.Type, 1)
            this.offline.count--;
            break;
          case DeviceStatus.Offline:
            this.offline.count++;
            this.ChangeCount(value.data.Id, value.data.Type, -1);
            break;
          case DeviceStatus.NewOffline:
            break;
          case DeviceStatus.Move:
            break;
          default:
            break;
        }
      })
      this.FilterChanged()
    }
  }
  private ChangeCount(id: string, type: string, count: number) {
    let c = this.Cates.find(c => c.code == (type || "").toLowerCase())
    if (c) c.count = Math.max((c.count || 0) + count, 0);
    let info: { Category: string } = { Category: undefined };
    if (this.AssetService) info = this.AssetService.Get(id, type) || { Category: undefined };
    let cd = this.CatesDetailed.find(c => c.code == (info.Category || "").toLowerCase())
    if (cd) cd.count = Math.max((cd.count || 0) + count, 0);
  }
  SearchName = "搜索资产名称"
  Timer: string
  Cates: Array<ICate> = []
  TempCates: Array<ICate>
  MainPageCates: Array<ICate> = []
  CatesDetailed: Array<ICate> = []
  TempCatesDetailed: Array<ICate>
  @Input()
  public Config: ToolbarConfig
  constructor(private AssetService: AssetService, private DeviceService: DeviceService, private Dialog: MatDialog) {

  }
  public Init() {

  }
  ngOnInit() {

  }
  OpenAdvancedSearch() {
    let ref = this.Dialog.open(FilterDialogComponent, {
      id: 'filterDialog', width: '80%', position: { top: "20px" }, disableClose: false
      , data: { CatesDetailed: this.CatesDetailed, Cates: this.Cates }
    });
    ref.afterClosed().subscribe((v) => {
      if (v == "changed") this.FilterChanged();
    })
  }
  OpenSetting() {
    let d = (this.AssetService.GetAssets() as Array<OffLines>).filter(a => {
      let dev = this.DeviceService.Obtain(a.Uid, a.Type);
      if (dev) a.lastTime = new Date(dev.Time as string).toLocaleString();
      return (dev && dev.Offline) || (!dev);
    })
    this.Dialog.open(SettingDialogComponent, { id: 'settingDialog', width: '50%', position: { top: '20px' }, data: { dialog: this.Dialog, dataSource: d } })
  }
  FilterChanged() {
    this.DeviceService.SetShowItem((gif) => {
      let i = this.AssetService.Get(gif.Id, gif.Type)
      if (!i) return false;
      let catedVisable: boolean = gif.Offline ? this.offline.visable : true;
      let c = i.Category.toLowerCase();
      let cated = this.CatesDetailed.find(cate => cate.code == c);
      catedVisable = (cated ? cated.visable : true) && catedVisable;
      //the offlines never verify the major types
      if (gif.Offline)
        return catedVisable;
      let t = gif.Type.toLowerCase();
      let cate = this.Cates.find(cate => cate.code == t);
      let visable = (cate ? cate.visable : true) && catedVisable
      return visable;
    })
  }
}

@Component({
  templateUrl: 'filter.dialog.html',
  selector: 'filter-dialog',
  styleUrls: ['filter.dialog.css']
})
export class FilterDialogComponent {
  TempCatesDetailed: Array<ICate>
  TempCates: Array<ICate>
  constructor(public ModalRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {//{ CatesDetailed: Array<ICate>, Cates: Array<ICate> }
    this.TempCatesDetailed = this.data.CatesDetailed.map(c => Extend({}, c))
    this.TempCates = this.data.Cates.map(c => Extend({}, c))
  }
  AdvancedSearchSave() {
    (this.data.CatesDetailed as Array<ICate>).forEach((c, i) => c.visable = this.TempCatesDetailed[i].visable);
    this.data.Cates.forEach((c, i) => c.visable = this.TempCates[i].visable);
    this.ModalRef.close("changed");
  }
}

@Component({
  templateUrl: 'setting.dialog.html', selector: 'setting-dialog',
  styleUrls: ['setting.dialog.css']
})
export class SettingDialogComponent {
  Data: { dialog: MatDialog, dataSource: Array<OffLines> }
  constructor(public ModalRef: MatDialogRef<SettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.Data = data;
  }
  public Offlines() {
    this.Data.dialog.open(OfflineAssetComponent, { id: 'offlines', width: '60%', height: '80%', data: { dataSource: this.Data.dataSource } })
  }
}

