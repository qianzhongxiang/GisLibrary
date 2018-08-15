export interface MsgConfig {
    "wsType"?: string,
    "mqttTopic"?: string,
    "ServiceURI"?: string,
}
export interface LocationConfig {
    "locationURI"?: string,
    "mqttTopic"?: string,
    "wsType"?: string,
}
export interface LayerGroup {
    OMS?: boolean,
    bg?: boolean,
    road?: boolean,
    distance?: boolean,
    marks?: boolean
    regions?: boolean
    index?: number
}
export interface AssetConfig {
    assetProfileUrl: string
    /**
     * 正序，目前不支持使用排序方法
     */
    sort?: boolean
}

export interface MapConifg {
    "geoServerUrl"?: string
    "mqttUser"?: string
    "mqttPd"?: string
    "trackOfComponent"?: boolean
    "locationConfig"?: LocationConfig
    "msgConfig"?: MsgConfig
    "webService"?: string
    "layers"?: LayerGroup | LayerGroup[],
    "centerPoint"?: Array<number>
    "centerSrs"?: string
    "srs"?: string
    "zoom"?: number
    "zoomrange"?: [number, number]
    "zoomfactor"?: number,
    "maxResolution"?: number,
    "minResolution"?: number,
    "resolutions"?: number[]
    "extent"?: [number, number, number, number]
    "geoServerGroup"?: string
    "frontEndEpsg"?: string
    "infoUrl"?: string
    "GWC"?: boolean
    floorSwitcher?: boolean
}
export interface TableConfig {
    columns: Array<TableItem>
    checkable?: boolean
}
export interface TableItem {
    field: string,
    title: string
}

export interface FormItem {
    type: 'select' | 'input' | 'checkbox' | 'radiobutton' | 'datepicker' | 'datetimepicker'
}
export interface MultiPanelConfiguration {
    "items": Array<
    {
        "class"?: string,
        "title"?: string,
        "code": string,
        "disable"?: boolean,
        "contentType": "table" | "form" | "html-str"
        // "tableConfig"?: TableConfig
        // "formConfig"?: FormConfig
    }
    >,
    "taskListSource": {
        "url": string
    }
}