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
    "geoServerUrl"?: string,
    "mqttUser"?: string,
    "mqttPd"?: string,
    "trackOfComponent"?: boolean,
    "locationConfig"?: LocationConfig,
    "msgConfig"?: MsgConfig
    "webService"?: string,
    "layers"?: {
        "OMS"?: boolean,
        "bg"?: boolean,
        "road"?: boolean,
        "distance"?: boolean,
        "marks"?: boolean
    },
    "centerPoint"?: Array<number>,
    "centerSrs"?: string
    "srs"?: string,
    "zoom"?: number,
    "geoServerGroup"?: string,
    "frontEndEpsg"?: string,
    "infoUrl"?: string
}
export interface TableConfig { }
export interface TableItem {
    field: string
}
export interface MultiPanelConfiguration {
    "items": Array<
    {
        "class"?: string,
        "title"?: string,
        "code": string,
        "disable"?: boolean,
        ""
    }
    >,
    "taskListSource": {
        "url": string
    }
}