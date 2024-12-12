import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrogTaskComponent } from './frog-task.component';

describe('FrogTaskComponent', () => {
  let component: FrogTaskComponent;
  let fixture: ComponentFixture<FrogTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrogTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrogTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
