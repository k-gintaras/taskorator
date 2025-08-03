import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNavigatorV2Component } from './task-navigator-v2.component';

describe('TaskNavigatorV2Component', () => {
  let component: TaskNavigatorV2Component;
  let fixture: ComponentFixture<TaskNavigatorV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskNavigatorV2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskNavigatorV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
