import { TestBed, inject } from '@angular/core/testing';

import { DeviceService } from './device.service';
import { ConfigurationService, FloorService } from '../..';

describe('DeviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigurationService, FloorService, DeviceService]
    });
  });

  it('should be created', inject([DeviceService], (service: DeviceService) => {
    expect(service).toBeTruthy();
  }));
});
