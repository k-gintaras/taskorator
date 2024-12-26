import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCreateComponent } from './search-create.component';

describe('SearchCreateComponent', () => {
  let component: SearchCreateComponent;
  let fixture: ComponentFixture<SearchCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
