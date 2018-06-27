import { Injectable } from '@angular/core';
import { Ajax, LogHelper } from 'vincijs';
import { AssetInfo } from './../../utilities/entities';

@Injectable()
export class AssetService {
  private Categories: Array<{ Title: string, Code: string }>
  private Assets: Array<AssetInfo>
  private Url: string
  constructor() {
  }
  public Init(Url: string) {
    this.Url = Url;
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
    new Ajax({ url: this.Url, data: {}, async: false, method: 'GET' }).done(d => {
      if (d) {
        if (d instanceof Array)
          this.Assets = d;
        else this.Assets = d.Data;
        this.Assets.forEach(i => { if (i.Uid) i.Id_Type = `${i.Uid.toLowerCase()}_${i.Type.toLowerCase()}` })
        this.Assets = this.Assets.sort((a, b) => {
          let at = a.Title.toLowerCase(), bt = b.Title.toLowerCase();
          if (at < bt) return -1;
          if (at > bt) return 1;
          return 0;
        })
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
