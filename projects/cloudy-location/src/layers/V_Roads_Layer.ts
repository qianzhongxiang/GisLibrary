import { LogHelper, Extend } from 'vincijs';
import ol_layer_image from 'ol/layer/Image';
import ol_source_imageWMS from 'ol/source/ImageWMS';
import ol_layer_vector from 'ol/layer/Vector';
import ol_format_GeoJSON from 'ol/format/GeoJSON';
import ol_source_vector from 'ol/source/Vector';
import { LayerOptions, MapWebServiceType } from './Layers';
export default (options: LayerOptions): ol.layer.Image => {
    const zIndex = options.zIndex || 20;
    let layer: ol.layer.Layer;
    switch (options.mapWebServiceType) {
        case MapWebServiceType.WMS:
            layer = new ol_layer_image({
                title: '道路图',
                zIndex: zIndex,
                source: new ol_source_imageWMS({
                    url: `${options.hostName}/wms`,
                    projection: 'EPSG:3857',
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        STYLES: '',
                        LAYERS: `${options.groupName}:Roads`
                    }
                })
            } as any);
            break;
        case MapWebServiceType.WFS:
            layer = new ol_layer_vector({
                title: '道路图',
                zIndex: zIndex,
                source: new ol_source_vector({
                    format: new ol_format_GeoJSON(),
                    url: (extent) => {
                        return `${options.hostName}/wfs?service=WFS&` +
                            `version=1.1.0&request=GetFeature&typename=${options.groupName}:Roads&` +
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
