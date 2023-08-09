import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskImportanceComponent } from './task-importance.component';

describe('TaskImportanceComponent', () => {
  let component: TaskImportanceComponent;
  let fixture: ComponentFixture<TaskImportanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskImportanceComponent]
    });
    fixture = TestBed.createComponent(TaskImportanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
