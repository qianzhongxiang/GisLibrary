import Feature from 'ol/feature'
import LineString from 'ol/geom/LineString'

export class Tracker {
    protected OldPoint: { x: number, y: number, z: number };
    protected Features: ol.Feature[];
    constructor(protected thickness: number = 3, startPoint: [number, number][]) {
        this.Features = [new Feature(new LineString(startPoint))];
    }
    /**
     * GetLayer
     */
    public GetFeature(): ol.Feature {
        return this.Features[this.Features.length - 1];
    }
    public AddPoint(point: [number, number]): Tracker {
        (this.GetFeature().getGeometry() as ol.geom.LineString).appendCoordinate(point);
        return this;
    }
    public Broke() {
        this.Features.push(new Feature(new LineString([])));
    }
    public AddPoints(points: [number, number][]): Tracker {
        const geom = this.GetFeature().getGeometry() as ol.geom.LineString;
        points.forEach(p => geom.appendCoordinate(p));

        return this;
    }
    public Simplify(number: number) {
        (this.GetFeature().getGeometry() as ol.geom.LineString).simplify(number);
    }
    /**
     * 需要layer.sourcey一并清空
     */
    public Clean() {
        this.Features = [new Feature(new LineString([]))];
        // (this.GetFeature().getGeometry() as ol.geom.LineString).setCoordinates([]);
    }
}