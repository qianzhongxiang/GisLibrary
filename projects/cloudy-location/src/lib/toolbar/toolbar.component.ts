import { DeviceStatus } from './../../utilities/enum';
import { ToolbarConfig, ICate, AssetInfo } from './../../utilities/entities';
import { GraphicOutInfo } from './../../graphic/Graphic';
import { DeviceService } from './../device-service/device.service';
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, Inject, Input, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Extend, DataSource, VinciWindow, VinciTable } from 'vincijs';
import { AssetService } from '../../public_api';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'cl-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  private offline: ICate
  ngAfterViewInit(): void {
    setInterval(() => { this.Timer = new Date().toLocaleTimeString() }, 1000)
    this.Cates = [...this.Config.items,
    this.offline = { title: "离线", code: "offline", visable: true, count: 0, color: "gray", mp: false, class: '' }];
    this.CatesDetailed = this.Config.itemsDetailed
    this.MainPageCates = this.Cates.filter(c => c.mp).concat(this.CatesDetailed.filter(c => c.mp));
    if (this.DeviceService) {
      this.DeviceService.Bind(this.DeviceService.Events.DeviceUpdate, (msg) => {
        var value: { data: GraphicOutInfo, type: DeviceStatus } = msg.Value
        switch (value.type) {
          case DeviceStatus.New:
            this.isdf(value.data.Id, value.data.type, 1)
            break;
          case DeviceStatus.Online:
            this.isdf(value.data.Id, value.data.type, 1)
            this.offline.count--;
            break;
          case DeviceStatus.Offline:
            this.isdf(value.data.Id, value.data.type, -1);
            this.offline.count++;
            break;
          case DeviceStatus.Move:
            break;
          default:
            break;
        }
      })
    }
  }
  private isdf(id: string, type: string, count: number) {
    let c = this.Cates.find(c => c.code == (type || "").toLowerCase())
    if (c) c.count = (c.count || 0) + count;
    let info: { Category: string } = { Category: undefined };
    if (this.AssetService) info = this.AssetService.Get(id, type) || { Category: undefined };
    let cd = this.CatesDetailed.find(c => c.code == (info.Category || "").toLowerCase())
    if (cd) cd.count = (cd.count || 0) + count;
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
  private Unconnected: VinciTable
  private CateIndex: { [code: string]: { ci: number, cdi: number } }
  constructor(private AssetService: AssetService, private DeviceService: DeviceService, private Dialog: MatDialog) {

  }
  public Init() {

  }
  ngOnInit() {

  }
  OpenAdvancedSearch() {
    // this.ModalRef = this.ModalService.show(template);
    let ref = this.Dialog.open(FilterDialogComponent, {
      id: 'filterDialog', width: '50%', position: { top: "20px" }, disableClose: false
      , data: { CatesDetailed: this.CatesDetailed, Cates: this.Cates }
    });
    ref.afterClosed().subscribe((v) => {
      if (v == "changed") this.FilterChanged();
    })
  }

  OpenSetting() {
    // this.SettingModalRef = this.ModalService.show(template);
  }
  FilterChanged() {
    let types: Array<[string, boolean]> = [];
    for (let b = 0; b < this.Cates.length; b++) {
      types.push([this.Cates[b].code, this.Cates[b].visable]);
    }
    this.DeviceService.SetShowItem((gif) => {
      if (gif.Offline) {
        return this.offline.visable;
      }
      let i = this.AssetService.Get(gif.Id, gif.type)
      let catedVisable: boolean = true;
      if (i) {
        let c = i.Category.toLowerCase();
        let cated = this.CatesDetailed.find(cate => cate.code == c);
        catedVisable = (cated ? cated.visable : true);
      }
      let t = gif.type.toLowerCase();
      let cate = this.Cates.find(cate => cate.code == t);
      let visable = (cate ? cate.visable : true) && catedVisable
      return visable;
    })
    // this.DeviceService.SetShowItem(types);
  }
  @ViewChild("unconnected", { read: ElementRef })
  Container: ElementRef
  ShowUnconnected() {
    let c = this.Container.nativeElement as HTMLDivElement;
    // let input = document.createElement("input");
    let list = document.createElement("div");
    list.style.overflow = "auto";
    list.style.height = "400px";
    // input.classList.add("form-control-sm")
    // container.classList.add("");
    // c.appendChild(input);
    c.appendChild(list);

    this.Unconnected = new VinciTable(list, {
      DataSource: new DataSource({
        Read: p => {
          let d = [];
          d = this.AssetService.GetAssets().filter(a => !this.DeviceService.Obtain(a.Uid))
          p.Success(d);
        }
      }), Columns: [{ field: "Title", title: "名称" }, { title: "类型", field: "Type" }, { title: "Id", field: "Uid" }]
    })
    let windo = new VinciWindow(list, { AutoDestory: true, Title: "未上线设备" });
    // this.SettingModalRef.hide();
    windo.Open();
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
    this.data.CatesDetailed.forEach((c, i) => Object.assign(c, this.TempCatesDetailed[i]));
    this.data.Cates.forEach((c, i) => Object.assign(c, this.TempCates[i]));
    this.ModalRef.close("changed");
  }
}

