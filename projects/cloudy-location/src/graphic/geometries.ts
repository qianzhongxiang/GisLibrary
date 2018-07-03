import Point from 'ol/geom/point';
import Feature from 'ol/Feature';
export abstract class Geometries {
    public static GetPoint(coordinates: [number, number], type: string) {
        return new Feature({
            type: type,
            geometry: new Point(coordinates)
        });
    }
}