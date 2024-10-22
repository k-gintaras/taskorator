import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitadelComponent } from './citadel.component';

describe('CitadelComponent', () => {
  let component: CitadelComponent;
  let fixture: ComponentFixture<CitadelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitadelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitadelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
