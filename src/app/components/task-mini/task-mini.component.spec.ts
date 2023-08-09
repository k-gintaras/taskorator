import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMiniComponent } from './task-mini.component';

describe('TaskMiniComponent', () => {
  let component: TaskMiniComponent;
  let fixture: ComponentFixture<TaskMiniComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskMiniComponent]
    });
    fixture = TestBed.createComponent(TaskMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
