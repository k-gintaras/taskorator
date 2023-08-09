import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlordManagerComponent } from './overlord-manager.component';

describe('OverlordManagerComponent', () => {
  let component: OverlordManagerComponent;
  let fixture: ComponentFixture<OverlordManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OverlordManagerComponent]
    });
    fixture = TestBed.createComponent(OverlordManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
