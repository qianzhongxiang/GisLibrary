export interface DataItem {
    X: number
    Y: number
    EPSG: number
    Type: string
    CollectTime: string
    Name: string
    UniqueId: string
    Duration: number
}
export interface AssetInfo {
    Uid: string
    Title: string
    Color: string
    Type: string
    Type_Id?: string
    Category: string
}