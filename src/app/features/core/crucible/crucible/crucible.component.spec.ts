import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrucibleComponent } from './crucible.component';

describe('CrucibleComponent', () => {
  let component: CrucibleComponent;
  let fixture: ComponentFixture<CrucibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrucibleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrucibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
