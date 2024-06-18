import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteTaskComponent } from './favorite-task.component';

describe('FavoriteTaskComponent', () => {
  let component: FavoriteTaskComponent;
  let fixture: ComponentFixture<FavoriteTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FavoriteTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
