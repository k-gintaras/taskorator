import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSimpleTaskComponent } from './add-simple-task.component';

describe('AddSimpleTaskComponent', () => {
  let component: AddSimpleTaskComponent;
  let fixture: ComponentFixture<AddSimpleTaskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSimpleTaskComponent]
    });
    fixture = TestBed.createComponent(AddSimpleTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
