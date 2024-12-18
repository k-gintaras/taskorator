import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlordNavigatorComponent } from './overlord-navigator.component';

describe('OverlordNavigatorComponent', () => {
  let component: OverlordNavigatorComponent;
  let fixture: ComponentFixture<OverlordNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlordNavigatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverlordNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
