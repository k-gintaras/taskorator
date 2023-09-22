import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOverlordComponent } from './select-overlord.component';

describe('SelectOverlordComponent', () => {
  let component: SelectOverlordComponent;
  let fixture: ComponentFixture<SelectOverlordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectOverlordComponent]
    });
    fixture = TestBed.createComponent(SelectOverlordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
