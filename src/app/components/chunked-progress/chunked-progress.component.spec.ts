import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChunkedProgressComponent } from './chunked-progress.component';

describe('ChunkedProgressComponent', () => {
  let component: ChunkedProgressComponent;
  let fixture: ComponentFixture<ChunkedProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChunkedProgressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChunkedProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
