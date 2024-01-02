import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioGeneratorComponent } from './scenario-generator.component';

describe('ScenarioGeneratorComponent', () => {
  let component: ScenarioGeneratorComponent;
  let fixture: ComponentFixture<ScenarioGeneratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScenarioGeneratorComponent]
    });
    fixture = TestBed.createComponent(ScenarioGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
