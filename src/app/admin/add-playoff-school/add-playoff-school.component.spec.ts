import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayoffSchoolComponent } from './add-playoff-school.component';

describe('AddPlayoffSchoolComponent', () => {
  let component: AddPlayoffSchoolComponent;
  let fixture: ComponentFixture<AddPlayoffSchoolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPlayoffSchoolComponent]
    });
    fixture = TestBed.createComponent(AddPlayoffSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
