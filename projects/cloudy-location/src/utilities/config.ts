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
export interface MapConifg {
    "geoServerUrl"?: string
    "mqttUser"?: string
    "mqttPd"?: string
    "trackOfComponent"?: boolean
    "locationConfig"?: LocationConfig
    "msgConfig"?: MsgConfig
    "webService"?: string
    "layers"?: {
        "OMS"?: boolean,
        "bg"?: boolean,
        "road"?: boolean,
        "distance"?: boolean,
        "marks"?: boolean
        "regions"?: boolean
    },
    "centerPoint"?: Array<number>
    "centerSrs"?: string
    "srs"?: string
    "zoom"?: number
    "zoomrange"?: [number, number]
    "zoomfactor"?: number,
    "maxResolution"?: number,
    "minResolution"?: number,
    "geoServerGroup"?: string
    "frontEndEpsg"?: string
    "infoUrl"?: string
    "GWC"?: boolean
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