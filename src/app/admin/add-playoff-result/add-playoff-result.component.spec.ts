import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayoffResultComponent } from './add-playoff-result.component';

describe('AddPlayoffResultComponent', () => {
  let component: AddPlayoffResultComponent;
  let fixture: ComponentFixture<AddPlayoffResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPlayoffResultComponent]
    });
    fixture = TestBed.createComponent(AddPlayoffResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
