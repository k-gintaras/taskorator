import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3VizualizerComponent } from './d3-vizualizer.component';

describe('D3VizualizerComponent', () => {
  let component: D3VizualizerComponent;
  let fixture: ComponentFixture<D3VizualizerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [D3VizualizerComponent]
    });
    fixture = TestBed.createComponent(D3VizualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
