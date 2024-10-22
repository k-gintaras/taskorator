import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestUpdatedTaskListComponent } from './latest-updated-task-list.component';

describe('LatestUpdatedTaskListComponent', () => {
  let component: LatestUpdatedTaskListComponent;
  let fixture: ComponentFixture<LatestUpdatedTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestUpdatedTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatestUpdatedTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
