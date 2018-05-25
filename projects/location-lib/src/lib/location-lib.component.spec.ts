import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationLibComponent } from './location-lib.component';

describe('LocationLibComponent', () => {
  let component: LocationLibComponent;
  let fixture: ComponentFixture<LocationLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
