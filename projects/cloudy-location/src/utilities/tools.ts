import ol_sphere from 'ol/sphere';
import { ProjectionTransform } from './olProjConvert';
import { EPSG } from './enum';

export class Tools {

    constructor() {

    }
    /**
     * MeasureLength unit:m
     */
    public static MeasureLength(sourceProj: string, ...points: [number, number][]) {
        const wsg84sphere = new ol_sphere(6378137);
        let lastPoint, length = 0;
        points.forEach(point => {
            const thisPoint = ProjectionTransform(point, sourceProj, EPSG.EPSG4326);
            if (lastPoint) {
                length += wsg84sphere.haversineDistance(lastPoint, thisPoint);
            }
            lastPoint = thisPoint;
        });
        return length;
    }

    /**
     * MeasureArea unit:m^2
     */
    public static MeasureArea(sourceProj: string, points: [number, number][]) {
        const wsg84sphere = new ol_sphere(6378137);
        return wsg84sphere.geodesicArea(points.map(p => ProjectionTransform(p, sourceProj, EPSG.EPSG4326)));
    }
}
