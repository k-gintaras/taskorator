import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseStatusComponent } from './database-status.component';

describe('DatabaseStatusComponent', () => {
  let component: DatabaseStatusComponent;
  let fixture: ComponentFixture<DatabaseStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatabaseStatusComponent]
    });
    fixture = TestBed.createComponent(DatabaseStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
