import { Injectable } from '@angular/core';
import { Ajax } from 'vincijs';
import { AssetInfo } from './../../utilities/entities';

@Injectable()
export class AssetService {
  private Categories: Array<{ Title: string, Code: string }>
  private Assets: Array<AssetInfo>
  private Url: string
  constructor() { }
  public Init(Url: string) {
    this.Url = Url;
  }
  GetAssets(): Array<AssetInfo> {
    if (!this.Assets) {
      this.GetInfoRemote();
    }
    return this.Assets;
  }
  protected GetInfoRemote() {
    this.Assets = [];
    new Ajax({ url: this.Url, data: {}, async: false }).done(d => {
      if (d && d.IsSuccess) {
        this.Assets = d.Data;
        this.Assets.forEach(i => i.Id_Type = `${i.Uid.toLowerCase()}_${i.Type.toLowerCase()}`)
      }
    });
    this.Assets = this.Assets.sort((a, b) => {
      let at = a.Title.toLowerCase(), bt = b.Title.toLowerCase();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    })
  }
  Get(uid: string, type: string) {
    if (!this.Assets) {
      this.GetInfoRemote();
    }
    return this.Assets.filter(i => {
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
