import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateHandlerComponent } from './template-handler.component';

describe('TemplateHandlerComponent', () => {
  let component: TemplateHandlerComponent;
  let fixture: ComponentFixture<TemplateHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateHandlerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TemplateHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
