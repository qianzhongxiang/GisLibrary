import { Extend } from 'vincijs';
import ol_layer_Tile from 'ol/layer/tile';
import ol_source_tileWMS from 'ol/source/TileWMS'
import ol_proj from 'ol/proj'
export default (options: { tiled?: boolean, hostName: string, groupName: string }): ol.layer.Tile => {
    options = Extend(options, { tiled: true })
    return new ol_layer_Tile({
        zIndex: 10,
        source: new ol_source_tileWMS({
            url: `${options.hostName}/wms`,
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                tiled: options.tiled,
                STYLES: '',
                LAYERS: `${options.groupName}:Bg`
            }
        })
    });
}
