import ol_layer_image from 'ol/layer/Image';
import ol_source_imageWMS from 'ol/source/ImageWMS';
import ol_layer_vector from 'ol/layer/Vector';
import ol_format_GeoJSON from 'ol/format/GeoJSON';
import ol_source_vector from 'ol/source/Vector';
import ol_proj from 'ol/proj';
import { LayerOptions, MapWebServiceType } from './Layers';
export default (options: LayerOptions): ol.layer.Image => {
    const zIndex = options.zIndex || 50;
    let layer: ol.layer.Layer;
    switch (options.mapWebServiceType) {
        case MapWebServiceType.WMS:
            layer = new ol_layer_image({
                title: '距离标识图',
                zIndex: zIndex,
                source: new ol_source_imageWMS({
                    url: `${options.hostName}/wms`,
                    projection: 'EPSG:3857',
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        STYLES: '',
                        LAYERS: `${options.groupName}:Distance`
                    }
                })
            } as any);
            break;
        case MapWebServiceType.WFS:
            layer = new ol_layer_vector({
                title: '距离标识图',
                zIndex: zIndex,
                source: new ol_source_vector({
                    format: new ol_format_GeoJSON(),
                    url: (extent) => {
                        return `${options.hostName}/wfs?service=WFS&` +
                            `version=1.1.0&request=GetFeature&typename=${options.groupName}:Distance&` +
                            `outputFormat=application/json&srsname=EPSG:3857&`;
                        // +
                        // `bbox=${extent.join(',')},EPSG:3857'`;
                    }
                })
            } as any);

            break;
        default:
            break;
    }
    return layer;
};
