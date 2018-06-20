import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiPanelsItemComponent } from './multi-panels-item.component';

describe('MultiPanelsItemComponent', () => {
  let component: MultiPanelsItemComponent;
  let fixture: ComponentFixture<MultiPanelsItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiPanelsItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiPanelsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
