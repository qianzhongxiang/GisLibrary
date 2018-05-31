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
export enum WSType {
    //None = 0,
    Location = 1,
    History = 10,
}
export interface RequestMsgObject {
    Type?: WSType
    Region?: string
    /**
     * svr default 3000
     */
    HistoryDuration?: number
    STime?: Date | string
    ETime?: Date | string
    UIds?: Array<string>
}
export interface ICate {
    "class": string,
    "title": string,
    "code": string,
    "color": string,
    "visable": boolean,
    "mp": boolean,
    "count": number
}
export interface ToolbarConfig {
    "items": Array<ICate>,
    "itemsDetailed": Array<ICate>
}