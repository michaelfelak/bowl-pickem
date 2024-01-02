import { Component, OnInit } from '@angular/core';
import { Tiebreaker } from 'src/app/shared/services/bowl.model';
import { BowlService } from 'src/app/shared/services/bowl.service';

@Component({
  selector: 'tiebreakers',
  templateUrl: './tiebreakers.component.html',
  styleUrls: ['./tiebreakers.component.scss']
})
export class TiebreakersComponent implements OnInit {
  public tiebreakers: Tiebreaker[] = [];
  constructor(private bowlService: BowlService) {

  }

  ngOnInit() {
    this.bowlService.getTiebreakers(2023).subscribe((result) => {
      this.tiebreakers = result;
    })
  }
}
