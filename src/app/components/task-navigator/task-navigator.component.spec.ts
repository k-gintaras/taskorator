import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNavigatorComponent } from './task-navigator.component';

describe('TaskNavigatorComponent', () => {
  let component: TaskNavigatorComponent;
  let fixture: ComponentFixture<TaskNavigatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskNavigatorComponent]
    });
    fixture = TestBed.createComponent(TaskNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
