import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StandingsEntry } from '../shared/services/bowl.model';
import { BowlService } from '../shared/services/bowl.service';
import {
  SkyFlyoutService,
  SkyFlyoutInstance,
  SkyFlyoutConfig,
} from '@skyux/flyout';
import { StandingsFlyoutComponent } from './standings-flyout/standings-flyout.component';
import { StandingsFlyoutContext } from './standings-flyout/standings-flyout.context';
import { SkyWaitService } from '@skyux/indicators';
import { SkyDropdownModule } from '@skyux/popovers';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/services/settings.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-standings',
  imports: [CommonModule, SkyDropdownModule],
  providers: [SettingsService],
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
})
export class StandingsComponent implements OnInit {
  public standings: StandingsEntry[] = [];
  public flyout: SkyFlyoutInstance<any> | undefined;
  public showStandingsLink = false; // this shows the flyout links, only enable after bowls start
  public isAdmin = false;
  public currentYear: number;
  public years: number[] = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

  public sortCurrentPoints = false;
  public sortRemainingPoints = false;
  public sortPossiblePoints = false;
  public sortCorrectPicks = false;

  public currentPointsDesc = false;
  public remainingPointsDesc = false;
  public possiblePointsDesc = false;
  public correctPicksDesc = false;

  constructor(
    private titleService: Title,
    private svc: BowlService,
    private flyoutService: SkyFlyoutService,
    private waitSvc: SkyWaitService,
    private settings: SettingsService,
    private authService: AuthService
  ) {
    this.currentYear = this.settings.currentYear;
    // Check admin status
    const userId = this.authService.getCurrentUserId();
    const userIdStr = userId ? userId.toString() : null;
    this.isAdmin = userIdStr === '2' || userIdStr === '3';
  }

  public ngOnInit() {
    this.titleService.setTitle("Bowl Pick'em - Standings");
    this.retrieveStandings(this.currentYear);
    this.showStandingsLink = this.settings.showStandingsFlyout;
  }

  public retrieveStandings(year: number) {
    // this.waitSvc.beginNonBlockingPageWait();

    this.svc.getStandings(year).subscribe((result: StandingsEntry[]) => {
      this.standings = result;
      this.assignRank();
      // this.waitSvc.endNonBlockingPageWait();
      return result;
    });
  }

  public assignRank() {
    if (this.standings) {
      this.standings = this.standings.sort(
        (a: StandingsEntry, b: StandingsEntry) => {
          if (a.current_points! > b.current_points!) {
            return -1;
          }

          if (a.current_points! < b.current_points!) {
            return 1;
          }

          return 0;
        }
      );

      let rank = 1;
      let nextRank = 1;
      let lastPoints = -1;
      this.standings.forEach(function (entry) {
        if (entry.current_points === lastPoints) {
          entry.rank = rank;
          nextRank += 1;
        } else {
          rank = nextRank;
          nextRank += 1;
          entry.rank = rank;
        }
        lastPoints = entry.current_points!;
      });
    }
  }

  public onNameClick(id: number) {
    const record: StandingsFlyoutContext = new StandingsFlyoutContext();
    record.entryId = id.toString();
    const flyoutConfig: SkyFlyoutConfig = {
      providers: [
        {
          provide: StandingsFlyoutContext,
          useValue: record,
        },
      ],
      defaultWidth: 500,
    };
    this.flyout = this.flyoutService.open(
      StandingsFlyoutComponent,
      flyoutConfig
    );

    this.flyout.closed.subscribe(() => {
      this.flyout = undefined;
    });
  }

  public updateYear(year: number) {
    this.currentYear = year;
    this.retrieveStandings(year);
  }

  public sortByCurrentPoints() {
    this.sortCurrentPoints = true;
    this.sortRemainingPoints =
      this.sortPossiblePoints =
      this.sortCorrectPicks =
        false;
    this.currentPointsDesc = !this.currentPointsDesc;

    if (this.standings) {
      if (this.currentPointsDesc) {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.current_points! > b.current_points! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.current_points! < b.current_points! ? -1 : 1;
        });
      }
    }
  }

  public sortByCorrectPicks() {
    this.sortCorrectPicks = true;
    this.sortRemainingPoints =
      this.sortPossiblePoints =
      this.sortCurrentPoints =
        false;
    this.correctPicksDesc = !this.correctPicksDesc;

    if (this.standings) {
      if (this.correctPicksDesc) {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.correct_picks! > b.correct_picks! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.correct_picks! < b.correct_picks! ? -1 : 1;
        });
      }
    }
  }

  public sortByRemainingPoints() {
    this.sortRemainingPoints = true;
    this.sortPossiblePoints =
      this.sortCorrectPicks =
      this.sortCurrentPoints =
        false;
    this.remainingPointsDesc = !this.remainingPointsDesc;

    if (this.standings) {
      if (this.remainingPointsDesc) {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.remaining_points! > b.remaining_points! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.remaining_points! < b.remaining_points! ? -1 : 1;
        });
      }
    }
  }
  public sortByPossiblePoints() {
    this.sortPossiblePoints = true;
    this.sortCorrectPicks =
      this.sortRemainingPoints =
      this.sortCurrentPoints =
        false;
    this.possiblePointsDesc = !this.possiblePointsDesc;

    if (this.standings) {
      if (this.possiblePointsDesc) {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.possible_points! > b.possible_points! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsEntry, b: StandingsEntry) => {
          return a.possible_points! < b.possible_points! ? -1 : 1;
        });
      }
    }
  }
}
