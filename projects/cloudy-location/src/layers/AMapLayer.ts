import ol_layer_Tile from 'ol/layer/tile';
import ol_source_xyz from 'ol/source/XYZ'
export default new ol_layer_Tile({
    source: new ol_source_xyz({
        minZoom: 3,
        maxZoom: 18,
        url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        //url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'  
        // tileUrlFunction:o=>{
        //     let o4=ol_proj.transform([o[1],o[2]], 'EPSG:3857', 'EPSG:4326')
        //     let os=coordtransform.wgs84togcj02(o4[0],o4[1])
        //     let o3=ol_proj.transform([os[1],os[2]], 'EPSG:4326', 'EPSG:3857')
        //     return `https://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x=${os[0]}&y=${os[1]}&z=${o[0]}`;
        // }
    })
});

// case "road":
// url = 'http://webrd0' + (col % 4 + 1) + '.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=' + col + '&y=' + row + '&z=' + level;
// break;
// case "st":
// url = 'http://webst0' + (col % 4 + 1) + '.is.autonavi.com/appmaptile?style=6&x=' + col + '&y=' + row + '&z=' + level;
// break;
// case "label":
// url = 'http://webst0' + (col % 4 + 1) + '.is.autonavi.com/appmaptile?style=8&x=' + col + '&y=' + row + '&z=' + level;
// break;
// default:
// url = 'http://webrd0' + (col % 4 + 1) + '.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=' + col + '&y=' + row + '&z=' + level;
// break;