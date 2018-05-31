import Feature from 'ol/feature'
import LineString from 'ol/geom/LineString'

export class Tracker {
    protected OldPoint: { x: number, y: number, z: number }
    protected Feature: ol.Feature
    constructor(protected thickness: number = 3, startPoint: [number, number][]) {
        this.Feature = new Feature(new LineString(startPoint))
    }
    /**
     * GetLayer
     */
    public GetFeature(): ol.Feature {
        return this.Feature;
    }
    public AddPoint(point: [number, number]): Tracker {
        (this.Feature.getGeometry() as ol.geom.LineString).appendCoordinate(point);
        return this;
    }
    public AddPoints(points: [number, number][]): Tracker {
        points.forEach(p => (this.Feature.getGeometry() as ol.geom.LineString).appendCoordinate(p))
        return this;
    }
}