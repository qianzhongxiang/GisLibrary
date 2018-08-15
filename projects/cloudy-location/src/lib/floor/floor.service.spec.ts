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
  it('should set options currently', inject([FloorService], (service: FloorService) => {
    expect(service.Floors.length).toBe(3)
  }))
  it('should get number and be noticed correctly', inject([FloorService], (service: FloorService) => {
    service.Bind(service.Events.Changed, m => {
      //it is wrong
      expect(m.Value).toBe(2)
    })
    service.SetFloor(2);
    expect(service.GetFloorNo()).toBe(2)
  }));

  it('should get correct floor', inject([FloorService], (service: FloorService) => {
    expect(service.GetFloor().index).toBe(1)
    service.SetFloor(3)
    expect(service.GetFloor().index).toBe(3)
  }))

  it('should get correct layers', inject([FloorService], (service: FloorService) => {
    expect(service.GetLayers().length).toBe(1)

    //layer processing by default
    service.AddLayers([{} as any, {} as any])
    expect(service.GetLayers().length).toBe(3)
    service.AddLayers([{} as any, {} as any])
    expect(service.GetLayers().length).toBe(5)
    service.ClearLayers();
    expect(service.GetLayers().length).toBe(1)

    service.SetFloor(3)
    expect(service.GetLayers().length).toBe(3)

    //layer processing on 3th floor

    service.AddLayers([{} as any, {} as any], 2)
    service.SetFloor(2)
    expect(service.GetLayers().length).toBe(4)
    service.ClearLayers(2);
    expect(service.GetLayers().length).toBe(2)

    //test for perfloor
    service.AddLayers([{} as any], false)
    service.SetFloor(2)
    expect(service.GetLayers().length).toBe(3)
  }))
});
