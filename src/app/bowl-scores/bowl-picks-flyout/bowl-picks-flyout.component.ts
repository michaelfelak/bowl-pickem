import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  Bowl,
  BowlPick,
  Game,
  GameResultModel,
  School,
  StandingsEntry
} from '../../shared/services/bowl.model';
import { BowlPicksFlyoutContext } from './bowl-picks-flyout.context';
import { SkyAppConfig } from '@skyux/config';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-bowl-picks-flyout',
  templateUrl: './bowl-picks-flyout.component.html',
  styleUrls: ['./bowl-picks-flyout.component.scss']
})
export class BowlPicksFlyoutComponent implements OnInit {
  public picks: BowlPick[] = [];
  public name: string = '';
  public points: number = 0;
  public standings: StandingsEntry[] = [];
  public bowlList: Bowl[] = [];
  public gameList: Game[] = [];
  public bowlName: string = '';
  public gameTime: Date = new Date();
  public team1name: string = '';
  public team2name: string = '';
  public team1score: number = 0;
  public team2score: number = 0;
  public schoolList: School[] = [];
  public gameResults: GameResultModel[] = [];
  public gameHasResult: boolean = false;

  public team1picks: number = 0;
  public team2picks: number = 0;

  private currentYear = '2023';

  constructor(
    public context: BowlPicksFlyoutContext,
    private svc: BowlService
  ) { }

  public ngOnInit() {
    this.svc
      .getStandings(2023)
      .pipe(
        mergeMap((standings: any) => {
          this.standings = standings;
          return this.svc.getBowlList();
        }),
        mergeMap((bowlList: any) => {
          this.bowlList = bowlList;
          return this.svc.getGameResults(
            this.currentYear
          );
        }),
        mergeMap((gameResults: GameResultModel[]) => {
          this.gameResults = gameResults;
          console.log(gameResults);
          return this.svc.getSchools();
        }),
        mergeMap((schoolList: any) => {
          this.schoolList = schoolList;
          return this.svc.getGames(this.currentYear);
        }),
        mergeMap((games: Game[]) => {
          this.gameList = games;
          let game = this.getGameById(this.context.gameId);
          this.team1name = this.getSchoolById(game.School1ID);
          this.team2name = this.getSchoolById(game.School2ID);
          this.gameTime = game.GameTime;
          this.setBowlName(game.BowlID);
          return this.svc.getBowlPicks(this.context.gameId);
        })
      )
      .subscribe((result: BowlPick[]) => {
        this.picks = result;

        this.sortPicks();
        this.assignGameResults();
        this.calculateTotalPicks();
      });
  }

  private calculateTotalPicks() {
    this.team1picks = this.picks.filter((pick) => {
      return pick.team_1_picked;
    }).length;
    
    this.team2picks = this.picks.filter((pick) => {
      return pick.team_2_picked;
    }).length;
  }

  private getSchoolById(schoolId: string): string {
    let school = this.schoolList.find((school) => {
      return school.ID === schoolId;
    });
    if (school) {
      return school.Name;
    }
    return '';
  }

  private getGameById(gameId: string): Game {
    let game = this.gameList.find((game) => {
      return game.ID === gameId;
    });
    if (game) {
      return game;
    }
    return new Game();

  }

  private sortPicks() {
    this.picks.forEach((pick) => {
      pick.totalPoints

      let pickEntry = this.standings.find((entry) => {
        return entry.entry_name === pick.name;
      });
      if (pickEntry) {
        pick.totalPoints = pickEntry.current_points
      }
      this.picks.sort((a: BowlPick, b: BowlPick) => {
        return a.totalPoints > b.totalPoints ? -1 : 1;
      });
    });
  }

  private setBowlName(bowlId: string) {
    let bowl = this.bowlList.find((result) => {
      return result.id === bowlId;
    });

    if (bowl) {
      this.bowlName = bowl.name;
    }
  }

  private assignGameResults() {
    this.picks.forEach((pick) => {
      let result = this.gameResults.find((gameResult) => {
        return pick.game_id.toString() === gameResult.game_id.toString();
      });
      if (result && result.score_1 !== result.score_2) {
        pick.team_1_won = result.score_1 > result.score_2;
        pick.team_2_won = result.score_1 < result.score_2;
        this.gameHasResult = true;
        this.team1score = result.score_1;
        this.team2score = result.score_2;

        if ((pick.team_1_won && !pick.team_1_picked) || (pick.team_2_won && !pick.team_2_picked)) {
          pick.earned_points = pick.points * -1;
        }
        else {
          pick.earned_points = pick.points;
        }
      } else {
        this.gameHasResult = false;
      }
    });
  }
}
