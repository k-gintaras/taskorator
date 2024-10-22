import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DreamforgeComponent } from './dreamforge.component';

describe('DreamforgeComponent', () => {
  let component: DreamforgeComponent;
  let fixture: ComponentFixture<DreamforgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DreamforgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DreamforgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
