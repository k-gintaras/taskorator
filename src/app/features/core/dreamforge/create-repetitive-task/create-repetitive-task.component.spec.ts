import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRepetitiveTaskComponent } from './create-repetitive-task.component';

describe('CreateRepetitiveTaskComponent', () => {
  let component: CreateRepetitiveTaskComponent;
  let fixture: ComponentFixture<CreateRepetitiveTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRepetitiveTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRepetitiveTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
