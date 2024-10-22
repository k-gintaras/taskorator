import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestCreatedTaskListComponent } from './latest-created-task-list.component';

describe('LatestCreatedTaskListComponent', () => {
  let component: LatestCreatedTaskListComponent;
  let fixture: ComponentFixture<LatestCreatedTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestCreatedTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatestCreatedTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
