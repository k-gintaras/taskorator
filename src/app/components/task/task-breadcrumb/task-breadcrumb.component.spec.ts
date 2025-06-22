import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBreadcrumbComponent } from './task-breadcrumb.component';

describe('TaskBreadcrumbComponent', () => {
  let component: TaskBreadcrumbComponent;
  let fixture: ComponentFixture<TaskBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBreadcrumbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
