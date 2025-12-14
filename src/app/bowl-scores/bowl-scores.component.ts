import { Component, Input, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import { AuthService } from '../shared/services/auth.service';
import {
  Bowl,
  Game,
  GameResultModel,
  School,
} from '../shared/services/bowl.model';
import { mergeMap } from 'rxjs/operators';
import {
  SkyFlyoutConfig,
  SkyFlyoutInstance,
  SkyFlyoutService,
} from '@skyux/flyout';
import { BowlPicksFlyoutComponent } from './bowl-picks-flyout/bowl-picks-flyout.component';
import { BowlPicksFlyoutContext } from './bowl-picks-flyout/bowl-picks-flyout.context';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-bowl-scores',
  imports: [CommonModule],
  providers: [SettingsService],
  templateUrl: './bowl-scores.component.html',
  styleUrls: ['./bowl-scores.component.scss'],
})
export class BowlScoresComponent implements OnInit {
  public games!: Game[];
  public gameResults: GameResultModel[] = [];
  public upcomingGames: GameResultModel[] = [];
  public todaysGames: GameResultModel[] = [];
  public bowls: Bowl[] = [];
  public schools: School[] = [];
  public todaysDate = '';
  public flyout: SkyFlyoutInstance<any> | undefined;
  @Input() public hideAllScores = false;
  public isAdmin = false;
  private currentYear: number = 0;

  constructor(
    private svc: BowlService,
    private flyoutService: SkyFlyoutService,
    private settings: SettingsService,
    private authService: AuthService
  ) {}

  public ngOnInit() {
    // Check admin status
    const userId = this.authService.getCurrentUserId();
    const userIdStr = userId ? userId.toString() : '';
    this.isAdmin = userIdStr === '2' || userIdStr === '3';

    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
      this.refresh();
    });
  }

  public refresh() {
    this.svc
      .getGames(this.currentYear)
      .pipe(
        mergeMap((result: Game[]) => {
          this.games = result;
          this.sortGamesByDate();
          return this.svc.getGameResults(this.currentYear);
        }),
        mergeMap((result: GameResultModel[]) => {
          this.gameResults = result.filter((game) => {
            return game.score_1! + game.score_2! > 0;
          });
          this.upcomingGames = result.filter((game) => {
            return (
              (game.score_1 ?? 0) + (game.score_2 ?? 0) === 0 &&
              new Date(game.game_time!).getDate() !== new Date().getDate()
            );
          });
          // console.log(new Date().getDate());

          // result.forEach((game) => {
          //   console.log(new Date(game.game_time!).getDate());
          // });
          this.todaysGames = result.filter((game) => {
            return new Date(game.game_time!).getDate() === new Date().getDate();
          });
          // console.log(result);
          // console.log(this.todaysGames);
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

    return {} as School;
  }

  public sortGamesByDate() {
    if (this.games) {
      this.games.sort((a: Game, b: Game) => {
        return +new Date(a.GameTime!) - +new Date(b.GameTime!);
      });
    }
  }

  public sortGamesResultsByDate() {
    if (this.gameResults) {
      this.gameResults.sort((a: GameResultModel, b: GameResultModel) => {
        return +new Date(a.game_time!) - +new Date(b.game_time!);
      });
    }
  }

  public teamWon(team: number, gameResult: GameResultModel): boolean {
    if (team === 1) {
      return gameResult.score_1! > gameResult.score_2!;
    }
    return gameResult.score_2! > gameResult.score_1!;
  }

  public onNameClick(id: string) {
    const record: BowlPicksFlyoutContext = new BowlPicksFlyoutContext();
    record.gameId = id;
    const flyoutConfig: SkyFlyoutConfig = {
      providers: [
        {
          provide: BowlPicksFlyoutContext,
          useValue: record,
        },
      ],
      defaultWidth: 500,
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
