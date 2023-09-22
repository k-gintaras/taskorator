import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskoratorComponent } from './taskorator.component';

describe('TaskoratorComponent', () => {
  let component: TaskoratorComponent;
  let fixture: ComponentFixture<TaskoratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskoratorComponent]
    });
    fixture = TestBed.createComponent(TaskoratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
