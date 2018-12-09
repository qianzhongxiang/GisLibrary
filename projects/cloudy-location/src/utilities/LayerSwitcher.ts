const OlLayerSwitcher = require('ol-layerswitcher');
export interface LayerSwitcherOptions {
    map: ol.Map;
    btnTitle?: string;
}
export class LayerSwitcher {
    constructor(options: LayerSwitcherOptions) {
        const control = new OlLayerSwitcher({
            tipLabel: options.btnTitle
        });
        options.map.addControl(control);
    }
}
