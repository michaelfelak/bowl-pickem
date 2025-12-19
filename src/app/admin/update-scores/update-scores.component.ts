import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  Bowl,
  School,
  Game,
  Entry,
  PickModel,
  GameResultModel,
} from '../../shared/services/bowl.model';
import { mergeMap } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SkyRepeaterModule } from '@skyux/lists';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { SkyToastService, SkyToastType } from '@skyux/toast';

@Component({
  standalone: true,
  selector: 'app-update-scores',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [SettingsService],
  templateUrl: './update-scores.component.html',
  styleUrls: ['./update-scores.component.scss'],
})
export class UpdateScoresComponent implements OnInit {
  public games: Game[] = [];
  public gameResults: GameResultModel[] = [];
  public picks: PickModel[] = [];
  public bowls: Bowl[] = [];
  public schools: School[] = [];
  public entries: Entry[] = [];

  private currentYear: number = 0;

  scoresForm = this.formBuilder.group({
    games: new FormArray([]),
  });

  get gamesFormArray(): FormArray {
    return this.scoresForm.get('games') as FormArray;
  }

  constructor(
    private svc: BowlService,
    private formBuilder: FormBuilder,
    private settings: SettingsService,
    private toastService: SkyToastService
  ) {
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.svc
      .getSchools()
      .pipe(
        mergeMap((result: School[]) => {
          this.schools = result;
          return this.svc.getGames(this.currentYear);
        }),
        mergeMap((result: Game[]) => {
          this.games = result;
          return this.svc.getEntries(this.currentYear);
        }),
        mergeMap((result: Entry[]) => {
          this.entries = result;
          return this.svc.getGameResults(this.currentYear);
        }),
        mergeMap((result: GameResultModel[]) => {
          this.gameResults = result;

          this.gameResults.forEach((result) => {
            this.gamesFormArray.push(
              this.formBuilder.group({
                gameId: new FormControl(result.game_id),
                team1name: new FormControl(result.team_1_name),
                team2name: new FormControl(result.team_2_name),
                bowlName: new FormControl(result.bowl_name),
                gameTime: new FormControl(result.game_time),
                score1: new FormControl(result.score_1),
                score2: new FormControl(result.score_2),
              })
            );
          });

          return this.svc.getBowlList();
        })
      )
      .subscribe(
        (result: Bowl[]) => {
          this.bowls = result;
          this.buildPicks();
          this.gameResults.sort((a: GameResultModel, b: GameResultModel) => {
            return (a.score_1 ?? 0) < (b.score_1 ?? 0) ? -1 : 1;
          });
        },
        (err: Error) => {
          console.log('error reaching the web service: ', err);
        }
      );
  }

  public getSchoolFromID(id: string): School {
    if (this.schools) {
      return this.schools.filter(function (school) {
        return school.id === id;
      })[0];
    }
    return {} as School;
  }

  public buildPicks() {
    if (this.games && this.bowls) {
      this.games.forEach((game: Game) => {
        const p = {} as PickModel;
        p.game_id = game.ID;
        p.team_1_name = this.getSchoolFromID(game.School1ID!).name;
        p.team_2_name = this.getSchoolFromID(game.School2ID!).name;
        const bowl = this.getBowlFromID(game.BowlID);
        // p.team_1 = false;
        // p.team_2 = false;
        p.bowl_name = bowl.name;
        p.game_time = dayjs(game.GameTime).format('MM/DD/YYYY');
        // p.points = 1;
        this.picks.push(p);
      });
    }
  }

  public updateBowlScore(id: string) {
    const gameA = this.gamesFormArray.value.find((game: any) => {
      return game.gameId === id;
    });
    let score1 = gameA.score1;
    let score2 = gameA.score2;
    const bowlName = gameA.bowlName;

    const r = {} as GameResultModel;
    r.game_id = id;
    if (!score1) {
      score1 = 0;
    }
    if (!score2) {
      score2 = 0;
    }
    r.score_1 = score1;
    r.score_2 = score2;
    const game = this.getGameFromID(id);
    if (score1 > score2) {
      r.winning_school_id = game.School1ID;
      r.losing_school_id = game.School2ID;
    } else if (score1 < score2) {
      r.losing_school_id = game.School1ID;
      r.winning_school_id = game.School2ID;
    }
    this.svc.addGameResult(r).subscribe(() => {
      this.toastService.openMessage(
        `${bowlName} Bowl was successfully updated`,
        {
          type: SkyToastType.Success,
        }
      );
    });
  }

  private getGameFromID(id: string): Game {
    return this.games.filter(function (game) {
      return game.ID === id;
    })[0];
  }

  private getBowlFromID(id: string | undefined): Bowl {
    return this.bowls.filter(function (bowl) {
      return bowl.id === id;
    })[0];
  }
}
