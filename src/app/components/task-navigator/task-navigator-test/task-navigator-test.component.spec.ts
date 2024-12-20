import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNavigatorTestComponent } from './task-navigator-test.component';

describe('TaskNavigatorTestComponent', () => {
  let component: TaskNavigatorTestComponent;
  let fixture: ComponentFixture<TaskNavigatorTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskNavigatorTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskNavigatorTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
