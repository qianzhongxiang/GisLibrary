export enum MapWebServiceType {
    WMS,
    WFS
}
export interface LayerOptions {
    hostName?: string;
    groupName?: string;
    GWC?: boolean;
    maxResolution?: number;
    minResolution?: number;
    resolutions?: Array<number>;
    extent?: [number, number, number, number];
    origins?: [number, number][];
    zIndex?: number;
    mapWebServiceType?: MapWebServiceType;
    // styles?
    visable?: boolean;
    layer?: ol.layer.Layer;
}

export interface RasterLayerOptions extends LayerOptions {
    tiled?: boolean;
    dpi?: number;
}
