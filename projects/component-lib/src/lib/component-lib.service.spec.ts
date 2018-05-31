import { TestBed, inject } from '@angular/core/testing';

import { ComponentLibService } from './component-lib.service';

describe('ComponentLibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComponentLibService]
    });
  });

  it('should be created', inject([ComponentLibService], (service: ComponentLibService) => {
    expect(service).toBeTruthy();
  }));
});
