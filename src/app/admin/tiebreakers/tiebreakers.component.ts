import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SkyRepeaterModule } from '@skyux/lists';
import { Tiebreaker } from 'src/app/shared/services/bowl.model';
import { BowlService } from 'src/app/shared/services/bowl.service';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-tiebreakers',
  imports: [CommonModule],
  providers: [SettingsService],
  templateUrl: './tiebreakers.component.html',
  styleUrls: ['./tiebreakers.component.scss'],
})
export class TiebreakersComponent implements OnInit {
  public tiebreakers: Tiebreaker[] = [];

  private currentYear: number = 0;

  constructor(
    private bowlService: BowlService,
    private settings: SettingsService
  ) {
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  ngOnInit() {
    this.bowlService.getTiebreakers(this.currentYear).subscribe((result) => {
      this.tiebreakers = result.sort((a: Tiebreaker, b: Tiebreaker) => {
        return a.tiebreaker_2! > b.tiebreaker_2! ? -1 : 1;
      });
    });
  }
}
