import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputToTasksComponent } from './input-to-tasks.component';

describe('InputToTasksComponent', () => {
  let component: InputToTasksComponent;
  let fixture: ComponentFixture<InputToTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputToTasksComponent]
    });
    fixture = TestBed.createComponent(InputToTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
