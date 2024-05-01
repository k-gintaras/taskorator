import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptTasksComponent } from './gpt-tasks.component';

describe('GptTasksComponent', () => {
  let component: GptTasksComponent;
  let fixture: ComponentFixture<GptTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GptTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GptTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
