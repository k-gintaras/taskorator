import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassEditorComponent } from './mass-editor.component';

describe('MassEditorComponent', () => {
  let component: MassEditorComponent;
  let fixture: ComponentFixture<MassEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MassEditorComponent]
    });
    fixture = TestBed.createComponent(MassEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
