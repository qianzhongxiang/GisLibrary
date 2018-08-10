import { LogHelper, Extend } from 'vincijs';
import ol_layer_image from 'ol/layer/Image';
import ol_source_imageWMS from 'ol/source/ImageWMS'
import ol_proj from 'ol/proj'
import { LayerOptions } from './Layers';
export default (options: LayerOptions): ol.layer.Image => {
    options = Extend(options, { tiled: true })
    return new ol_layer_image({
        zIndex: 50,
        source: new ol_source_imageWMS({
            url: `${options.hostName}/wms`,
            projection: "EPSG:3857",
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                STYLES: '',
                LAYERS: `${options.groupName}:Distance`
            }
        })
    });
}
