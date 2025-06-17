import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskoratorMainComponent } from './taskorator-main.component';

describe('TaskoratorMainComponent', () => {
  let component: TaskoratorMainComponent;
  let fixture: ComponentFixture<TaskoratorMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskoratorMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskoratorMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
