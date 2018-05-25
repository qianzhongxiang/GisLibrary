import { TestBed, inject } from '@angular/core/testing';

import { LocationLibService } from './location-lib.service';

describe('LocationLibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationLibService]
    });
  });

  it('should be created', inject([LocationLibService], (service: LocationLibService) => {
    expect(service).toBeTruthy();
  }));
});
