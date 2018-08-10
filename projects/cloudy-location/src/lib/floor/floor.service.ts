import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private CurrentFloorNo: number;
  constructor() { }
  GetLayers(): ol.style.Style[] {
    return [];
  }
  GetFloorNo(): number {
    return this.CurrentFloorNo;
  }
  SetFloors() {

  }

}
