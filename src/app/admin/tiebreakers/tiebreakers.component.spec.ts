import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiebreakersComponent } from './tiebreakers.component';

describe('TiebreakersComponent', () => {
  let component: TiebreakersComponent;
  let fixture: ComponentFixture<TiebreakersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TiebreakersComponent]
    });
    fixture = TestBed.createComponent(TiebreakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
