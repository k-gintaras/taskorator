import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtificerComponent } from './artificer.component';

describe('ArtificerComponent', () => {
  let component: ArtificerComponent;
  let fixture: ComponentFixture<ArtificerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtificerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArtificerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
