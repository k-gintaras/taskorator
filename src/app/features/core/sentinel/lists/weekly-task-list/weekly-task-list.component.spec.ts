import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyTaskListComponent } from './weekly-task-list.component';

describe('WeeklyTaskListComponent', () => {
  let component: WeeklyTaskListComponent;
  let fixture: ComponentFixture<WeeklyTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeeklyTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
