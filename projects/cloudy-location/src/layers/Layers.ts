export interface LayerOptions {
    hostName: string;
    groupName: string;
    GWC?: boolean;
    maxResolution?: number;
    minResolution?: number;
    resolutions?: Array<number>;
    extent?: [number, number, number, number];
    origins?: [number, number][];
    zIndex?: number;
}

export interface RasterLayerOptions extends LayerOptions {
    tiled?: boolean;
    dpi?: number;
}
