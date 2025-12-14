import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { AuthService } from '../../shared/services/auth.service';
import {
  Bowl,
  BowlPick,
  Game,
  GameResultModel,
  School,
  StandingsEntry,
} from '../../shared/services/bowl.model';
import { BowlPicksFlyoutContext } from './bowl-picks-flyout.context';
import { mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { StatusIndicatorComponent } from '../../shared/status-indicator/status-indicator.component';
import { SchoolLogoComponent } from '../../shared/school-logo/school-logo.component';

@Component({
  standalone: true,
  selector: 'app-bowl-picks-flyout',
  imports: [CommonModule, StatusIndicatorComponent, SchoolLogoComponent],
  providers: [SettingsService],
  templateUrl: './bowl-picks-flyout.component.html',
  styleUrls: ['./bowl-picks-flyout.component.scss'],
})
export class BowlPicksFlyoutComponent implements OnInit {
  public picks: BowlPick[] = [];
  public name = '';
  public points = 0;
  public standings: StandingsEntry[] = [];
  public bowlList: Bowl[] = [];
  public gameList: Game[] = [];
  public bowlName = '';
  public gameTime: Date = new Date();
  public team1name = '';
  public team2name = '';
  public team1logo_id = '';
  public team2logo_id = '';
  public team1score = 0;
  public team2score = 0;
  public schoolList: School[] = [];
  public gameResults: GameResultModel[] = [];
  public gameHasResult = false;
  public isAdmin = false;

  public team1picks = 0;
  public team2picks = 0;
  private currentYear: number = 0;

  constructor(
    public context: BowlPicksFlyoutContext,
    private svc: BowlService,
    private authService: AuthService,
    private settings: SettingsService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  public ngOnInit() {
    this.svc
      .getStandings(this.currentYear)
      .pipe(
        mergeMap((standings: any) => {
          this.standings = standings;
          return this.svc.getBowlList();
        }),
        mergeMap((bowlList: any) => {
          this.bowlList = bowlList;
          return this.svc.getGameResults(this.currentYear);
        }),
        mergeMap((gameResults: GameResultModel[]) => {
          this.gameResults = gameResults;
          return this.svc.getSchools();
        }),
        mergeMap((schoolList: any) => {
          this.schoolList = schoolList;
          return this.svc.getGames(this.currentYear);
        }),
        mergeMap((games: Game[]) => {
          this.gameList = games;
          const game = this.getGameById(this.context.gameId);
          this.team1name = this.getSchoolById(game.School1ID!);
          this.team1logo_id = this.getSchoolLogoById(game.School1ID!);
          this.team2name = this.getSchoolById(game.School2ID!);
          this.team2logo_id = this.getSchoolLogoById(game.School2ID!);
          this.gameTime = game.GameTime!;
          this.setBowlName(game.BowlID!);
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
      return pick.team_1_picked === true;
    }).length;

    this.team2picks = this.picks.filter((pick) => {
      return pick.team_2_picked === true;
    }).length;
  }

  private getSchoolById(schoolId: string): string {
    const school = this.schoolList.find((school) => {
      return school.ID === schoolId;
    });
    if (school) {
      return school.Name!;
    }
    return '';
  }

  private getSchoolLogoById(schoolId: string): string {
    const school = this.schoolList.find((school) => {
      return school.ID === schoolId;
    });
    if (school && school.logo_id) {
      return school.logo_id;
    }
    return '';
  }

  private getGameById(gameId: string): Game {
    const game = this.gameList.find((game) => {
      return game.ID === gameId;
    });
    if (game) {
      return game;
    }
    return {} as Game;
  }

  private sortPicks() {
    this.picks.forEach((pick) => {
      const pickEntry = this.standings.find((entry) => {
        return entry.entry_name === pick.name;
      });
      if (pickEntry) {
        pick.totalPoints = pickEntry.current_points;
      }
    });
    
    this.picks.sort((a: BowlPick, b: BowlPick) => {
      return a.totalPoints! > b.totalPoints! ? -1 : 1;
    });
  }

  private setBowlName(bowlId: string) {
    const bowl = this.bowlList.find((result) => {
      return result.id === bowlId;
    });

    if (bowl) {
      this.bowlName = bowl.name!;
    }
  }

  private assignGameResults() {
    this.picks.forEach((pick) => {
      const result = this.gameResults.find((gameResult) => {
        return pick.game_id!.toString() === gameResult.game_id!.toString();
      });
      if (result && result.score_1 !== result.score_2) {
        pick.team_1_won = result.score_1! > result.score_2!;
        pick.team_2_won = result.score_1! < result.score_2!;
        this.gameHasResult = true;
        this.team1score = result.score_1!;
        this.team2score = result.score_2!;
        if (pick.team_1_picked !== undefined && pick.team_1_won !== undefined) {
          pick.correct1 =
            pick.team_1_picked === true && pick.team_1_won === true;
        }
        if (pick.team_2_picked !== undefined && pick.team_2_won !== undefined) {
          pick.correct2 =
            pick.team_2_picked === true && pick.team_2_won === true;
        }

        if (
          (pick.team_1_won && !pick.team_1_picked) ||
          (pick.team_2_won && !pick.team_2_picked)
        ) {
          pick.earned_points = pick.points! * -1;
        } else {
          pick.earned_points = pick.points;
        }
      } else {
        this.gameHasResult = false;
      }
    });
  }
}
