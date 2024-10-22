import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RootTaskListComponent } from './root-task-list.component';

describe('RootTaskListComponent', () => {
  let component: RootTaskListComponent;
  let fixture: ComponentFixture<RootTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RootTaskListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RootTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
