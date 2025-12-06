import { Component, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import { SettingsService } from '../shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-scenario-generator',
  templateUrl: './scenario-generator.component.html',
  styleUrls: ['./scenario-generator.component.scss'],
})
export class ScenarioGeneratorComponent implements OnInit {
  constructor(
    private bowlService: BowlService,
    private settingsService: SettingsService
  ) {}
  ngOnInit(): void {}
}
