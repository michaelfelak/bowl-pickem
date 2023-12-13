import { Component, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import {
  Bowl,
  Game,
  GameResultModel,
  School,
  TodaysGame
} from '../shared/services/bowl.model';
import { SkyAppConfig } from '@skyux/config';
import { mergeMap } from 'rxjs/operators';
import {
  SkyFlyoutConfig,
  SkyFlyoutInstance,
  SkyFlyoutService
} from '@skyux/flyout';

@Component({
  selector: 'bowl-scores',
  templateUrl: './bowl-scores.component.html',
  styleUrls: ['./bowl-scores.component.scss']
})
export class BowlScoresComponent implements OnInit {
  public games!: Game[];
  public gameResults: GameResultModel[] = [];
  public todaysGames: TodaysGame[] = [];
  public bowls: Bowl[] = [];
  public schools: School[] = [];
  public todaysDate: string='';
  public flyout!: SkyFlyoutInstance<any>;

  constructor(
    private svc: BowlService,
    private config: SkyAppConfig,
    private flyoutService: SkyFlyoutService
  ) {}

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.svc
      .getGames('2023')
      .pipe(
        mergeMap((result: Game[]) => {
          this.games = result;
          this.sortGamesByDate();
          return this.svc.getGameResults(
            '2023'
          );
        }),
        mergeMap((result: GameResultModel[]) => {
          this.gameResults = result;
          this.sortGamesResultsByDate();
          return this.svc.getBowlList();
        }),
        mergeMap((result: Bowl[]) => {
          this.bowls = result;
          return this.svc.getTodaysGames();
        })
      )
      .subscribe((result: TodaysGame[]) => {
        this.todaysDate = new Date().toDateString();
        this.todaysGames = result;
      });
  }

  public getSchoolFromID(id: string): School {
    if (this.schools) {
      return this.schools.filter(function (school) {
        return school.ID === id;
      })[0];
    }

    return new School();
  }

  public sortGamesByDate() {
    if (this.games) {
      this.games.sort((a: Game, b: Game) => {
        return +new Date(a.GameTime) - +new Date(b.GameTime);
      });
    }
  }

  public sortGamesResultsByDate() {
    if (this.gameResults) {
      this.gameResults.sort((a: GameResultModel, b: GameResultModel) => {
        return +new Date(a.game_time) - +new Date(b.game_time);
      });
    }
  }

  public teamWon(team: number, gameResult: GameResultModel): boolean {
    if (team === 1) {
      return gameResult.score_1 > gameResult.score_2;
    }
    return gameResult.score_2 > gameResult.score_1;
  }
}
