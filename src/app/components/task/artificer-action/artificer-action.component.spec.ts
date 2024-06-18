import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtificerActionComponent } from './artificer-action.component';

describe('ArtificerActionComponent', () => {
  let component: ArtificerActionComponent;
  let fixture: ComponentFixture<ArtificerActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtificerActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArtificerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
