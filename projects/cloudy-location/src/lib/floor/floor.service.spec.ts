import { TestBed, inject } from '@angular/core/testing';

import { FloorService } from './floor.service';

describe('FloorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: FloorService, useFactory: () => {
          let service = new FloorService();
          service.SetOptions({
            layerOptions: {
              hostName: 'geoServerUrl'
              , groupName: 'geoServerGroup'
            }
            , floors: [{ bg: true }, { bg: true, OMS: true }, { bg: true, OMS: true, road: true }]
          })
          return service;
        }
      }]
    });
  });

  it('should get number and be noticed correctly', inject([FloorService], (service: FloorService) => {
    service.Bind(service.Events.Changed, m => {
      expect(m.Value).toBe(2)
    })
    service.SetFloor(2);
    expect(service.GetFloorNo()).toBe(2)
  }));
  it('should get correct layers', inject([FloorService], (service: FloorService) => {
    expect(service.GetLayers().length).toBe(1)
    service.SetFloor(3)
    expect(service.GetLayers().length).toBe(3)
  }))
});
