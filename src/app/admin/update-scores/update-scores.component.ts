import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  Bowl,
  School,
  Game,
  Entry,
  PickModel,
  GameResultModel
} from '../../shared/services/bowl.model';
import { SkyAppConfig } from '@skyux/config';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'update-scores',
  templateUrl: './update-scores.component.html',
  styleUrls: ['./update-scores.component.scss']
})
export class UpdateScoresComponent implements OnInit {
  public games: Game[] = [];
  public gameResults: GameResultModel[] = [];
  public picks: PickModel[] = [];
  public bowls: Bowl[] = [];
  public schools: School[] = [];
  public entries: Entry[] = [];
  constructor(private svc: BowlService, private config: SkyAppConfig) { }

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.svc
      .getSchools()
      .pipe(
        mergeMap((result: School[]) => {
          this.schools = result;
          return this.svc.getGames('2023');
        }),
        mergeMap((result: Game[]) => {
          this.games = result;
          return this.svc.getEntries();
        }),
        mergeMap((result: Entry[]) => {
          this.entries = result;
          return this.svc.getGameResults(
            '2023'
          );
        }),
        mergeMap((result: GameResultModel[]) => {
          this.gameResults = result;
          return this.svc.getBowlList();
        })
      )
      .subscribe(
        (result: Bowl[]) => {
          this.bowls = result;
          this.buildPicks();
        },
        (err: Error) => {
          console.log('error reaching the web service: ', err);
        }
      );
  }

  public getSchoolFromID(id: string): School {
    if (this.schools) {
      return this.schools.filter(function (school) {
        return school.ID === id;
      })[0];
    }
    return new School();
  }

  public buildPicks() {
    if (this.games && this.bowls) {
      this.games.forEach((game: Game) => {
        let p: PickModel = new PickModel();
        p.game_id = game.ID;
        p.team_1_name = this.getSchoolFromID(game.School1ID).Name;
        p.team_2_name = this.getSchoolFromID(game.School2ID).Name;
        let bowl = this.getBowlFromID(game.BowlID);
        // p.team_1 = false;
        // p.team_2 = false;
        p.bowl_name = bowl.name;
        // p.game_time = moment(game.GameTime).format('MM/DD/YYYY');
        // p.points = 1;
        this.picks.push(p);
      });
    }
  }

  public updateBowlScore(id: string, score1: number, score2: number) {
    let r = new GameResultModel();
    r.game_id = id;
    if (!score1) {
      score1 = 0;
    }
    if (!score2) {
      score2 = 0;
    }
    r.score_1 = score1;
    r.score_2 = score2;
    let game = this.getGameFromID(id);
    if (score1 > score2) {
      r.winning_school_id = game.School1ID;
      r.losing_school_id = game.School2ID;
    } else if (score1 < score2) {
      r.losing_school_id = game.School1ID;
      r.winning_school_id = game.School2ID;
    }
    this.svc.addGameResult(r).subscribe();
    console.log('score updated');
    console.log(r);
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
