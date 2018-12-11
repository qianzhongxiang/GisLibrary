import scaleLine from 'ol/control/ScaleLine';
import { olx } from 'openlayers';

export class ScaleLine {
    constructor(map: ol.Map, options?: olx.control.ScaleLineOptions) {
        map.addControl(new scaleLine(options));
    }
}
