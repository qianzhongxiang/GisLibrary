export interface LayerOptions {
    hostName: string
    groupName: string
    GWC?: boolean
    maxResolution?: number
    minResolution?: number
}

export interface RasterLayerOptions extends LayerOptions {
    tiled?: boolean
    dpi?: number
}