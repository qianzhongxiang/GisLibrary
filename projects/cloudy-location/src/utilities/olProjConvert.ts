import { EPSG } from './enum';
import ol_proj from 'ol/proj';

const EPSGList = ['EPSG:4326', 'EPSG:3857'];
export function GetProjByEPSG(epsg: EPSG): string {
    return EPSGList[epsg];
}

export function ProjectionTransform(point: [number, number], sourceProject: EPSG, targetProject: EPSG): [number, number] {
    return ol_proj.transform(point, GetProjByEPSG(sourceProject), GetProjByEPSG(targetProject));
}