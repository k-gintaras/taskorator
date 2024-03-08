import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTasksComponent } from './test-tasks.component';

describe('TestTasksComponent', () => {
  let component: TestTasksComponent;
  let fixture: ComponentFixture<TestTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestTasksComponent]
    });
    fixture = TestBed.createComponent(TestTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
