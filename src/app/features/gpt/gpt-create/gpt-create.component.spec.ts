import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptCreateComponent } from './gpt-create.component';

describe('GptCreateComponent', () => {
  let component: GptCreateComponent;
  let fixture: ComponentFixture<GptCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GptCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GptCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
