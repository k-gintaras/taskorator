import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VortexComponent } from './vortex.component';

describe('VortexComponent', () => {
  let component: VortexComponent;
  let fixture: ComponentFixture<VortexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VortexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VortexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
