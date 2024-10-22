import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusTaskListComponent } from './focus-task-list.component';

describe('FocusTaskListComponent', () => {
  let component: FocusTaskListComponent;
  let fixture: ComponentFixture<FocusTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocusTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FocusTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
