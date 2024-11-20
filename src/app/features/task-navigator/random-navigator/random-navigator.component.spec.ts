import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomNavigatorComponent } from './random-navigator.component';

describe('RandomNavigatorComponent', () => {
  let component: RandomNavigatorComponent;
  let fixture: ComponentFixture<RandomNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomNavigatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RandomNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
