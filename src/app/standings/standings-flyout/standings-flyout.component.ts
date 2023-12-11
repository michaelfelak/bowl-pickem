import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  CompletedEntry,
  CompletedPick
} from '../../shared/services/bowl.model';
import { StandingsFlyoutContext } from './standings-flyout.context';

@Component({
  selector: 'app-standings-flyout',
  templateUrl: './standings-flyout.component.html',
  styleUrls: ['./standings-flyout.component.scss']
})
export class StandingsFlyoutComponent implements OnInit {
  public entry!: CompletedEntry;
  public picks: CompletedPick[] = [];
  public name!: string;
  public points: number = 0;

  constructor(
    public context: StandingsFlyoutContext,
    private svc: BowlService
  ) {}

  public ngOnInit() {
    this.svc
      .getStandingsEntry(this.context.entryId)
      .subscribe((result: any) => {
        this.entry = result;
        this.name = this.entry.entry_name;
        this.picks = this.entry.picks;
        this.picks.forEach((a: CompletedPick) => {
          if (a.earned_points) {
            this.points += a.earned_points;
          }
        });
      });
  }
}
