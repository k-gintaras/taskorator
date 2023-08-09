import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSimpleTaskComponent } from './create-simple-task.component';

describe('CreateSimpleTaskComponent', () => {
  let component: CreateSimpleTaskComponent;
  let fixture: ComponentFixture<CreateSimpleTaskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateSimpleTaskComponent]
    });
    fixture = TestBed.createComponent(CreateSimpleTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
