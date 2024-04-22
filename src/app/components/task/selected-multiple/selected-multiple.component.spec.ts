import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedMultipleComponent } from './selected-multiple.component';

describe('SelectedMultipleComponent', () => {
  let component: SelectedMultipleComponent;
  let fixture: ComponentFixture<SelectedMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedMultipleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
