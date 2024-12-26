import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEditPopupComponent } from './task-edit-popup.component';

describe('TaskEditPopupComponent', () => {
  let component: TaskEditPopupComponent;
  let fixture: ComponentFixture<TaskEditPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskEditPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
