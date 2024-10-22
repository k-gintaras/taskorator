import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextTaskManagerComponent } from './next-task-manager.component';

describe('NextTaskManagerComponent', () => {
  let component: NextTaskManagerComponent;
  let fixture: ComponentFixture<NextTaskManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextTaskManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NextTaskManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
