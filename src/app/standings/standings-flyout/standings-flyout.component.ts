import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  CompletedEntry,
  CompletedPick,
  PlayoffPickFlyout,
} from '../../shared/services/bowl.model';
import { StandingsFlyoutContext } from './standings-flyout.context';
import { CommonModule } from '@angular/common';
import { mergeMap } from 'rxjs';
import { StatusIndicatorComponent } from '../../shared/status-indicator/status-indicator.component';

@Component({
  standalone: true,
  selector: 'app-standings-flyout',
  imports: [CommonModule, StatusIndicatorComponent],
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
        console.log(result);
        this.entry = result;
        this.name = this.entry.entry_name!;
        this.picks = this.entry.picks!;
        this.picks.forEach((pick: CompletedPick) => {
          // Set correct1 and correct2 based on whether the picked team won
          if (pick.team_1_won || pick.team_2_won) {
            pick.correct1 = pick.team_1 ? (pick.team_1_won ? true : false) : undefined;
            pick.correct2 = pick.team_2 ? (pick.team_2_won ? true : false) : undefined;
          }
          if (pick.earned_points) {
            this.points += pick.earned_points;
          }
        });
      });
  }
}
