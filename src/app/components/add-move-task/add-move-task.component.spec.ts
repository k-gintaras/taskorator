import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMoveTaskComponent } from './add-move-task.component';

describe('AddMoveTaskComponent', () => {
  let component: AddMoveTaskComponent;
  let fixture: ComponentFixture<AddMoveTaskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMoveTaskComponent]
    });
    fixture = TestBed.createComponent(AddMoveTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
