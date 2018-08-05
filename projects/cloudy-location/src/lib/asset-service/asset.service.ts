import { Injectable } from '@angular/core';
import { Ajax, LogHelper } from 'vincijs';
import { AssetInfo } from './../../utilities/entities';

@Injectable()
export class AssetService {
  private Categories: Array<{ Title: string, Code: string }>
  private Assets: Array<AssetInfo>
  private Url: string
  private Sort: boolean
  constructor() {
  }
  public Init(Url: string, sort: boolean = true) {
    this.Url = Url;
    this.Sort = sort;
    this.GetInfoRemote();
  }
  /**get all online assets */
  public GetAssets(): Array<AssetInfo> {
    return this.GetAllAssets().filter(a => a.Uid);
  }
  public GetAllAssets(): Array<AssetInfo> {
    if (!this.Assets) {
      this.GetInfoRemote();
    }
    return this.Assets
  }
  private GetInfoRemote() {
    new Ajax({ url: this.Url, data: { time: new Date().getTime() }, async: false, method: 'GET' }).done(d => {
      if (d) {
        if (d instanceof Array)
          this.Assets = d;
        else this.Assets = d.Data;
        this.Assets.forEach(i => { if (i.Uid) i.Id_Type = `${i.Uid.toLowerCase()}_${i.Type.toLowerCase()}` })
        if (this.Sort) {
          this.Assets = this.Assets.sort((a, b) => {
            let at = a.Title.toLowerCase(), bt = b.Title.toLowerCase();
            if (at < bt) return -1;
            if (at > bt) return 1;
            return 0;
          })
        }
      }
    });
  }

  Get(uid: string, type: string) {
    if (!this.Assets) {
      this.GetInfoRemote();
    }
    return this.GetAssets().filter(i => {
      if (type)
        return i.Type.toLowerCase() == type.toLowerCase() && i.Uid == uid
      else
        return i.Uid == uid;
    })[0];
  }
  GetCategorys(): Array<{}> {
    if (!this.Categories)
      this.Categories = [{ Title: "卡车", Code: "" }, { Title: "大型机械", Code: "" }, { Title: "小型机械", Code: "" }, { Title: "人员", Code: "" }]
    return this.Categories;
  }

}
