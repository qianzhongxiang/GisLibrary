export interface LayerOptions {
    hostName: string
    groupName: string
    GWC?: boolean
}

export interface RasterLayerOptions extends LayerOptions {
    tiled?: boolean
    dpi?: number
}