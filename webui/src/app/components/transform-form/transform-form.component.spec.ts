import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransformFormComponent } from './transform-form.component';

describe('TransformFormComponent', () => {
  let component: TransformFormComponent;
  let fixture: ComponentFixture<TransformFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransformFormComponent]
    });
    fixture = TestBed.createComponent(TransformFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
