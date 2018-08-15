import { MsgType } from "./enum";
export let Id_TypeGenerator = (id: string, type: string) => `${id.toLowerCase()}_${type.toLowerCase()}`
export interface DataItem {
    X: number
    Y: number
    EPSG: number
    Type: string
    CollectTime: string
    Name: string
    UniqueId: string
    Duration: number
    Offline?: boolean
    Direction?: number
    CustomInterval: number
    Region?: string
    Floor?: number
}
export interface AssetInfo {
    Id: string
    Uid: string
    Title: string
    Color: string
    Type: string
    CategoryName?: string
    Id_Type?: string
    Category: string
    AssetStatus: string
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
    "iconClass"?: string
    "class"?: string,
    "title"?: string,
    "code"?: string,
    "color"?: string,
    "visable"?: boolean,
    "mp"?: boolean,
    "count"?: number
}
export interface ToolbarConfig {
    "items": Array<ICate>,
    "itemsDetailed": Array<ICate>
}

export interface MsgEntity {
    MsgType: MsgType
    SubType?: string
    Title?: string
    Uid: string
    DevType: string
    Msg?: string
    AssetName?: string
}
export interface WarningEntity {
    WarningType: string
    WarningTitle: string
    DeviceType: string
    DeviceId: string
    AssetName: string
    Msg: string
}
export type OffLines = AssetInfo & { lastTime?: string }