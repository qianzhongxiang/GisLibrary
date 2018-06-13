import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiPanelsComponent } from './multi-panels.component';

describe('MultiPanelsComponent', () => {
  let component: MultiPanelsComponent;
  let fixture: ComponentFixture<MultiPanelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiPanelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiPanelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
