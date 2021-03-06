import { Extend, LogHelper } from 'vincijs';
import ol_layer_Tile from 'ol/layer/tile';
import ol_source_tileWMS from 'ol/source/TileWMS';
import ol_tilegrid_tilegrid from 'ol/tilegrid/TileGrid';
import { RasterLayerOptions } from './Layers';
export default (options: RasterLayerOptions): ol.layer.Tile => {
    options = Extend(options, { tiled: true });
    const zIndex = options.zIndex || 10;
    const p = {
        'FORMAT': 'image/png',
        'VERSION': '1.1.1',
        tiled: options.tiled,
        STYLES: '',
        LAYERS: `${options.groupName}:Bg`,
    };
    let grid: ol.tilegrid.TileGrid;
    if (options.resolutions) {
        if (!options.extent) { LogHelper.Error('extent must be required, if speicify resolutions'); }
        grid = new ol_tilegrid_tilegrid({
            resolutions: options.resolutions,
            extent: options.extent // [1.314009166E7, 3053691.66, 1.370329166E7, 3872891.66]
            , origins: options.origins
        });
    }
    return new ol_layer_Tile({
        title: '实景图',
        zIndex: zIndex,
        source: new ol_source_tileWMS({
            url: `${options.hostName}${options.GWC ? '/gwc/service' : ''}/wms`,
            params: p,
            // serverType: 'geoserver',
            // hidpi: true,
            projection: 'EPSG:3857',
            tileGrid: grid
        }),
        visible: options.visable
        // maxResolution: options.maxResolution,
        // minResolution: options.minResolution
    } as any);
};
