import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterManagerComponent } from './filter-manager.component';

describe('FilterManagerComponent', () => {
  let component: FilterManagerComponent;
  let fixture: ComponentFixture<FilterManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterManagerComponent]
    });
    fixture = TestBed.createComponent(FilterManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
