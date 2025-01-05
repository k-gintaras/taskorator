import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassAddPopupComponent } from './mass-add-popup.component';

describe('MassAddPopupComponent', () => {
  let component: MassAddPopupComponent;
  let fixture: ComponentFixture<MassAddPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MassAddPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MassAddPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
