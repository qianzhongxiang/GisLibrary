import { FloorService } from './floor.service';
import { DeviceService } from './../device-service/device.service';
import { OlMapService } from './../map-service/ol-map.service';
import { Component, OnInit, Input, Optional } from '@angular/core';

export interface Floor {
  index: number
  // extent:[number,number,number,number]
  z?: number
  height?: number
}

@Component({
  selector: 'cl-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.css']
})
export class FloorComponent implements OnInit {
  @Input('floors')
  public Floors: Floor[] = []
  constructor(public FloorService: FloorService) { }

  ngOnInit() {
  }
  Click(f: Floor) {
    this.FloorService.SetFloor(f.index)
  }
}
