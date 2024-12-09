import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  CompletedEntry,
  CompletedPick,
  PlayoffPick,
  PlayoffPickFlyout,
} from '../../shared/services/bowl.model';
import { StandingsFlyoutContext } from './standings-flyout.context';
import { SkyIconModule } from '@skyux/indicators';
import { CommonModule } from '@angular/common';
import { mergeMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-standings-flyout',
  imports: [CommonModule, SkyIconModule],
  templateUrl: './standings-flyout.component.html',
  styleUrls: ['./standings-flyout.component.scss'],
})
export class StandingsFlyoutComponent implements OnInit {
  public entry!: CompletedEntry;
  public picks: CompletedPick[] = [];
  public name!: string;
  public points = 0;

  constructor(
    public context: StandingsFlyoutContext,
    private svc: BowlService
  ) {}

  public playoffPicks: PlayoffPickFlyout = {};

  public ngOnInit() {
    this.svc
      .getPlayoffPickForFlyout(this.context.entryId)
      .pipe(
        mergeMap((playoffResult) => {
          console.log(playoffResult);
          this.playoffPicks = playoffResult;
          return this.svc.getStandingsEntry(this.context.entryId);
        })
      )
      .subscribe((result: any) => {
        this.entry = result;
        this.name = this.entry.entry_name!;
        this.picks = this.entry.picks!;
        this.picks.forEach((a: CompletedPick) => {
          if (a.earned_points) {
            this.points += a.earned_points;
          }
        });
      });
  }
}
