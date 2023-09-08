import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlordBrowserComponent } from './overlord-browser.component';

describe('OverlordBrowserComponent', () => {
  let component: OverlordBrowserComponent;
  let fixture: ComponentFixture<OverlordBrowserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OverlordBrowserComponent]
    });
    fixture = TestBed.createComponent(OverlordBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
