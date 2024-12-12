import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSessionDialogComponent } from './task-session-dialog.component';

describe('TaskSessionDialogComponent', () => {
  let component: TaskSessionDialogComponent;
  let fixture: ComponentFixture<TaskSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSessionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
