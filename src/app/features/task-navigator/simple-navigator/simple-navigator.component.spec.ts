import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleNavigatorComponent } from './simple-navigator.component';

describe('SimpleNavigatorComponent', () => {
  let component: SimpleNavigatorComponent;
  let fixture: ComponentFixture<SimpleNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleNavigatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SimpleNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
