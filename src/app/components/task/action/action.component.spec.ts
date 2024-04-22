import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskActionComponent } from './action.component';

describe('ActionComponent', () => {
  let component: TaskActionComponent;
  let fixture: ComponentFixture<TaskActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
