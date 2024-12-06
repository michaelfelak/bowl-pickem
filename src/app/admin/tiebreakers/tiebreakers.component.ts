import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SkyRepeaterModule } from '@skyux/lists';
import { Tiebreaker } from 'src/app/shared/services/bowl.model';
import { BowlService } from 'src/app/shared/services/bowl.service';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-tiebreakers',
  imports: [CommonModule, SkyRepeaterModule],
  providers: [SettingsService],
  templateUrl: './tiebreakers.component.html',
  styleUrls: ['./tiebreakers.component.scss'],
})
export class TiebreakersComponent implements OnInit {
  public tiebreakers: Tiebreaker[] = [];
  constructor(
    private bowlService: BowlService,
    private settings: SettingsService
  ) {}

  ngOnInit() {
    this.bowlService
      .getTiebreakers(this.settings.currentYear)
      .subscribe((result) => {
        this.tiebreakers = result;
      });
  }
}
