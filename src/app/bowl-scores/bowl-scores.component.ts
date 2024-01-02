import { Component, Input, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import {
  Bowl,
  Game,
  GameResultModel,
  School
} from '../shared/services/bowl.model';
import { SkyAppConfig } from '@skyux/config';
import { mergeMap } from 'rxjs/operators';
import {
  SkyFlyoutConfig,
  SkyFlyoutInstance,
  SkyFlyoutService
} from '@skyux/flyout';
import { BowlPicksFlyoutComponent } from './bowl-picks-flyout/bowl-picks-flyout.component';
import { BowlPicksFlyoutContext } from './bowl-picks-flyout/bowl-picks-flyout.context';

@Component({
  selector: 'bowl-scores',
  templateUrl: './bowl-scores.component.html',
  styleUrls: ['./bowl-scores.component.scss']
})
export class BowlScoresComponent implements OnInit {
  public games!: Game[];
  public gameResults: GameResultModel[] = [];
  public upcomingGames: GameResultModel[] = [];
  public todaysGames: GameResultModel[] = [];
  public bowls: Bowl[] = [];
  public schools: School[] = [];
  public todaysDate: string = '';
  public flyout: SkyFlyoutInstance<any> | undefined;
  @Input() public hideAllScores: boolean = false;

  constructor(
    private svc: BowlService,
    private config: SkyAppConfig,
    private flyoutService: SkyFlyoutService
  ) { }

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
          this.gameResults = result.filter((game) => {
            return game.score_1 + game.score_2 > 0;
          });
          this.upcomingGames = result.filter((game) => {
            return game.score_1 + game.score_2 === 0 &&
              new Date(game.game_time).getDate() !== new Date().getDate();
          });
          console.log(new Date().getDate());

          result.forEach((game) => {
            console.log(new Date(game.game_time).getDate());

          })
          this.todaysGames = result.filter((game) => {
            return new Date(game.game_time).getDate() === new Date().getDate();
          })
          console.log(result);
          console.log(this.todaysGames);
          this.sortGamesResultsByDate();
          return this.svc.getBowlList();
        }),
        mergeMap((result: Bowl[]) => {
          this.bowls = result;
          return this.svc.getTodaysGames();
        })
      )
      .subscribe();
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

  public onNameClick(id: string) {
    let record: BowlPicksFlyoutContext = new BowlPicksFlyoutContext();
    record.gameId = id;
    const flyoutConfig: SkyFlyoutConfig = {
      providers: [
        {
          provide: BowlPicksFlyoutContext,
          useValue: record
        }
      ],
      defaultWidth: 500
    };
    this.flyout = this.flyoutService.open(
      BowlPicksFlyoutComponent,
      flyoutConfig
    );

    this.flyout.closed.subscribe(() => {
      this.flyout = undefined;
    });
  }
}
