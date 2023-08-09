import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWithSearchComponent } from './add-with-search.component';

describe('AddWithSearchComponent', () => {
  let component: AddWithSearchComponent;
  let fixture: ComponentFixture<AddWithSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddWithSearchComponent]
    });
    fixture = TestBed.createComponent(AddWithSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
