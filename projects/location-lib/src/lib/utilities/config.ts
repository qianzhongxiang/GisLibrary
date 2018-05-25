export interface MapConifg {
    "geoServerUrl"?: string,
    "wsType"?: string,
    "mqttTopic"?: string,
    "mqttUser"?: string,
    "mqttPd"?: string,
    "locationSocketURI"?: string,
    "trackOfComponent"?: boolean,
    "warningService"?: string,
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
    "geoServerGroup"?: string
}