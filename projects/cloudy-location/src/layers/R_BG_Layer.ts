import { Extend } from 'vincijs';
import ol_layer_Tile from 'ol/layer/tile';
import ol_source_tileWMS from 'ol/source/TileWMS'
import ol_proj from 'ol/proj'
import { RasterLayerOptions } from './LayerOptions';
export default (options: RasterLayerOptions): ol.layer.Tile => {
    options = Extend(options, { tiled: true })
    let p = {
        'FORMAT': 'image/jpeg',
        'VERSION': '1.1.1',
        tiled: options.tiled,
        STYLES: '',
        LAYERS: `${options.groupName}:Bg`,
        CRS: 'EPSG:3857',
        SRS: 'EPSG:3857',
        TRANSPARENT: false
    }

    return new ol_layer_Tile({
        zIndex: 10,
        source: new ol_source_tileWMS({
            url: `${options.hostName}${options.GWC ? '/gwc/service' : ''}/wms`,
            params: p,
            // serverType: 'geoserver',
            // hidpi: true,
            projection: 'EPSG:3857'
        })
    });
}
