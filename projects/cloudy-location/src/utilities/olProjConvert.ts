import { EPSG } from "./enum";
const EPSGList = ["EPSG:4326", "EPSG:3857"];
export function GetProjByEPSG(epsg: EPSG): string {
    return EPSGList[epsg];
}