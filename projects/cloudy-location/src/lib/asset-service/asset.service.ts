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
    // this.Assets = JSON.parse('[{"Uid":"130123776","Type":"SF","Title":"2#装载机(金景)"},{"Uid":"1455458304","Type":"InCar","Title":"1#装载机(金景)"},{"Uid":"1438681088","Type":"InCar","Title":"2#装载机(群首)"},{"Uid":"113346560","Type":"InCar","Title":"1#装载机(群首)"},{"Uid":"532776960","Type":"InCar","Title":"3#叉车"},{"Uid":"1505789952","Type":"InCar","Title":"15#装载机"},{"Uid":"1350732032","Type":"InCar","Title":"7#卸船机"},{"Uid":"1266845952","Type":"InCar","Title":"2#装船机"},{"Uid":"327321856","Type":"InCar","Title":"1#装船机"},{"Uid":"377587968","Type":"InCar","Title":"3#装船机"},{"Uid":"1585613056","Type":"InCar","Title":"4#装船机"},{"Uid":"193628416","Type":"InCar","Title":"5#卸船机"},{"Uid":"897747200","Type":"InCar","Title":"备用"},{"Uid":"998410496","Type":"InCar","Title":"1#叉车"},{"Uid":"1539344384","Type":"InCar","Title":"2#叉车"},{"Uid":"1589676032","Type":"InCar","Title":"13#装载机"},{"Uid":"180455424","Type":"InCar","Title":"9#装载机"},{"Uid":"750880768","Type":"InCar","Title":"14#装载机"},{"Uid":"767657984","Type":"InCar","Title":"7#装载机"},{"Uid":"884705280","Type":"InCar","Title":"8#装载机"},{"Uid":"1489012736","Type":"InCar","Title":"5#装载机"},{"Uid":"851150848","Type":"InCar","Title":"1#装载机"},{"Uid":"415336448","Type":"InCar","Title":"6#装载机"},{"Uid":"1103136768","Type":"InCar","Title":"11#装载机"},{"Uid":"784041984","Type":"InCar","Title":"10#装载机"},{"Uid":"1519422208","Type":"InCar","Title":"16#装载机"},{"Uid":"817989632","Type":"InCar","Title":"2#装载机"},{"Uid":"12683264","Type":"InCar","Title":"备用"},{"Uid":"163678208","Type":"InCar","Title":"3#装载机"},{"Uid":"63014912","Type":"InCar","Title":"4#装载机"},{"Uid":"352544071942263","Type":"GPSTag","Title":"2#"},{"Uid":"352544071942362","Type":"GPSTag","Title":"31#"},{"Uid":"352544071945738","Type":"GPSTag","Title":"22#"},{"Uid":"352544071945795","Type":"GPSTag","Title":"27#"},{"Uid":"352544071943097","Type":"GPSTag","Title":"3#"},{"Uid":"352544071943139","Type":"GPSTag","Title":"28#"},{"Uid":"352544071945662","Type":"GPSTag","Title":"7#"},{"Uid":"352544071942297","Type":"GPSTag","Title":"19#"},{"Uid":"352544071945787","Type":"GPSTag","Title":"23#"},{"Uid":"352544071945720","Type":"GPSTag","Title":"30#"},{"Uid":"352544071941554","Type":"GPSTag","Title":"32#"},{"Uid":"352544071942735","Type":"GPSTag","Title":"16#"},{"Uid":"352544071942487","Type":"GPSTag","Title":"20#"},{"Uid":"352544071942586","Type":"GPSTag","Title":"36#"},{"Uid":"352544071942776","Type":"GPSTag","Title":"15#"},{"Uid":"352544071941760","Type":"GPSTag","Title":"39#"},{"Uid":"352544071943105","Type":"GPSTag","Title":"33#"},{"Uid":"352544071942248","Type":"GPSTag","Title":"5#"},{"Uid":"352544071942271","Type":"GPSTag","Title":"34#"},{"Uid":"352544071941562","Type":"GPSTag","Title":"18#"},{"Uid":"352544071942420","Type":"GPSTag","Title":"17#"},{"Uid":"352544071943170","Type":"GPSTag","Title":"10#"},{"Uid":"352544071941729","Type":"GPSTag","Title":"38#"},{"Uid":"352544071943238","Type":"GPSTag","Title":"1#"},{"Uid":"869697536","Type":"InCar","Title":"10#自卸车"},{"Uid":"1272350720","Type":"InCar","Title":"2#自卸车"},{"Uid":"352544071941851","Type":"GPSTag","Title":"25#"},{"Uid":"1339459584","Type":"InCar","Title":"7#自卸车"},{"Uid":"352544071942883","Type":"GPSTag","Title":"40#"},{"Uid":"1171687424","Type":"InCar","Title":"2#斗轮机"},{"Uid":"1524008960","Type":"InCar","Title":"11#自卸车"},{"Uid":"701925376","Type":"InCar","Title":"3#斗轮机"},{"Uid":"352544071945704","Type":"GPSTag","Title":"12#"},{"Uid":"1289127936","Type":"InCar","Title":"6#斗轮机"},{"Uid":"1389791232","Type":"InCar","Title":"1#自卸车"},{"Uid":"534153216","Type":"InCar","Title":"6#卸船机"},{"Uid":"1590528000","Type":"InCar","Title":"4#卸船机"},{"Uid":"352544071941547","Type":"GPSTag","Title":"4#"},{"Uid":"1087801344","Type":"InCar","Title":"1#装车机"},{"Uid":"14125056","Type":"InCar","Title":"8#卸船机"},{"Uid":"1154910208","Type":"InCar","Title":"8#自卸车"},{"Uid":"352544071942115","Type":"GPSTag","Title":"8#"},{"Uid":"735479808","Type":"InCar","Title":"1#卸船机"},{"Uid":"1003915264","Type":"InCar","Title":"2#卸船机"},{"Uid":"1657636864","Type":"InCar","Title":"13#自卸车"},{"Uid":"352544071945696","Type":"GPSTag","Title":"13#"},{"Uid":"1557563392","Type":"InCar","Title":"1#斗轮机"},{"Uid":"1138132992","Type":"InCar","Title":"3#自卸车"},{"Uid":"352544071941695","Type":"GPSTag","Title":"14#"},{"Uid":"1406568448","Type":"InCar","Title":"4#斗轮机"},{"Uid":"1573750784","Type":"InCar","Title":"3#卸船机"},{"Uid":"1540196352","Type":"InCar","Title":"5#自卸车"},{"Uid":"352544071945639","Type":"GPSTag","Title":"9#"},{"Uid":"1640859648","Type":"InCar","Title":"2#挖机"},{"Uid":"903251968","Type":"InCar","Title":"1#挖机"},{"Uid":"352544071943030","Type":"GPSTag","Title":"37#"},{"Uid":"668370944","Type":"InCar","Title":"9#自卸车"},{"Uid":"352544071941844","Type":"GPSTag","Title":"26#"},{"Uid":"1238796288","Type":"InCar","Title":"7#斗轮机"},{"Uid":"801212416","Type":"InCar","Title":"12#装载机"},{"Uid":"547588096","Type":"InCar","Title":"6#自卸车"},{"Uid":"352544071942198","Type":"GPSTag","Title":"29#"},{"Uid":"1237354496","Type":"InCar","Title":"12#自卸车"},{"Uid":"352544071941646","Type":"GPSTag","Title":"11#"},{"Uid":"02021009","Type":"CellPhone","Title":"4#"},{"Uid":"02020285","Type":"CellPhone","Title":"3#"},{"Uid":"02020590","Type":"CellPhone","Title":"1#"},{"Uid":"352544071941513","Type":"GPSTag","Title":"6#"},{"Uid":"02020677","Type":"CellPhone","Title":"2#"},{"Uid":"02020520","Type":"CellPhone","Title":"6#"},{"Uid":"352544071945621","Type":"GPSTag","Title":"21#"},{"Uid":"02020716","Type":"CellPhone","Title":"5#"},{"Uid":"02020196","Type":"CellPhone","Title":"7#"},{"Uid":"352544071944046","Type":"GPSTag","Title":"24#"},{"Uid":"02020375","Type":"CellPhone","Title":"10#"},{"Uid":"02021045","Type":"CellPhone","Title":"11#"},{"Uid":"02020274","Type":"CellPhone","Title":"9#"},{"Uid":"02020524","Type":"CellPhone","Title":"8#"},{"Uid":"352544071942388","Type":"GPSTag","Title":"35#"},{"Uid":"02020649","Type":"CellPhone","Title":"12#"}]')
    // this.Assets.forEach(i => i.Id_Type = `${i.Uid.toLowerCase()}_${i.Type.toLowerCase()}`)
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
