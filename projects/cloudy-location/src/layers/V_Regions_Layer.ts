import ol_source_imageWMS from 'ol/source/ImageWMS';
import ol_source_vector from 'ol/source/Vector';
import ol_layer_image from 'ol/layer/Image';
import ol_layer_vector from 'ol/layer/Vector';
import ol_format_GeoJSON from 'ol/format/GeoJSON';
import { LayerOptions, MapWebServiceType } from './Layers';

export default (options: LayerOptions): ol.layer.Image | ol.layer.Vector => {
    let layer: ol.layer.Layer;
    const zIndex = options.zIndex || 51;
    switch (options.mapWebServiceType) {
        case MapWebServiceType.WMS:
            layer = new ol_layer_image({
                title: '区域',
                zIndex: zIndex,
                source: new ol_source_imageWMS({
                    url: `${options.hostName}/wms`,
                    projection: 'EPSG:3857',
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        STYLES: '',
                        LAYERS: `${options.groupName}:Regions`
                    }
                }),
                visible: options.visable
            } as any);
            break;
        case MapWebServiceType.WFS:
            layer = new ol_layer_vector({
                title: '区域',
                zIndex: zIndex,
                source: new ol_source_vector({
                    format: new ol_format_GeoJSON(),
                    url: (extent) => {
                        return `${options.hostName}/wfs?service=WFS&` +
                            `version=1.1.0&request=GetFeature&typename=${options.groupName}:Regions&` +
                            `outputFormat=application/json&srsname=EPSG:3857&`;
                        // +
                        // `bbox=${extent.join(',')},EPSG:3857'`;
                    }
                }),
                visible: options.visable
            } as any);

            break;
        default:
            break;
    }
    return layer;
};
