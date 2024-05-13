import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOverlordComponent } from './search-overlord.component';

describe('SearchOverlordComponent', () => {
  let component: SearchOverlordComponent;
  let fixture: ComponentFixture<SearchOverlordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchOverlordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchOverlordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
