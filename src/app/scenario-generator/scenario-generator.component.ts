import { Component, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';

@Component({
  selector: 'app-scenario-generator',
  templateUrl: './scenario-generator.component.html',
  styleUrls: ['./scenario-generator.component.scss']
})
export class ScenarioGeneratorComponent implements OnInit {
  constructor(private bowlService: BowlService) {

  }
  ngOnInit(): void {
    this.bowlService.getStandings(2023).subscribe((result) => {
      console.log(result);
    })
  }
}
