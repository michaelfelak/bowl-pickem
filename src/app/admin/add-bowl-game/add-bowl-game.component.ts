import { Component, Input, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import {
  Bowl,
  School,
  Game,
  GameResultModel
} from '../../shared/services/bowl.model';
// import * as moment from 'moment';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'add-bowl-game',
  templateUrl: './add-bowl-game.component.html',
  styleUrls: ['./add-bowl-game.component.scss']
})
export class AddBowlGameComponent implements OnInit {
  @Input() public hour: number = 1;
  @Input() public minute: number = 0;
  @Input() public channel!: string;
  @Input() public year: number = new Date().getFullYear();
  @Input() public gameDate!: Date;
  public stations: string[] = [
    'ESPN',
    'ESPN2',
    'ABC',
    'FOX',
    'FS1',
    'CBSSN',
    'CBS'
  ];
  @Input() public selectedStation: string = this.stations[0];
  public selectedBowl: Bowl = new Bowl();
  public selectedSchool1: School = new School();
  public selectedSchool2: School = new School();
  public isChampionship: boolean = false;
  public isPlayoff: boolean = false;
  public bowls: Bowl[] = [];
  public schools: School[] = [];
  public addMessage!: string;
  constructor(private svc: BowlService) {}

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.svc
      .getSchools()
      .pipe(
        mergeMap((result: School[]) => {
          this.schools = result;
          if (this.schools) {
            this.selectedSchool1 = this.schools[0];
            this.selectedSchool2 = this.schools[1];
          }
          return this.svc.getBowlList();
        })
      )
      .subscribe(
        (result: Bowl[]) => {
          this.bowls = result;
          this.sortBowls();
          if (this.bowls) {
            this.selectedBowl = this.bowls[0];
          }
        },
        (err: Error) => {
          console.log('error reaching the web service: ', err);
        }
      );
  }

  public sortBowls() {
    if (this.bowls) {
      this.bowls.sort((a: Bowl, b: Bowl) => {
        return a.name > b.name ? 1 : -1;
      });
    }
  }

  public addBowlGame() {
    this.addMessage = '';
    // let year = Number(moment(this.gameDate).format('YYYY'));
    // let month = Number(moment(this.gameDate).format('MM')) - 1;
    // let day = Number(moment(this.gameDate).format('DD'));
    let year = 1;
    let month = 1;
    let day = 1;

    let game = new Game();
    game.BowlID = this.selectedBowl.id;
    game.School1ID = this.selectedSchool1.ID;
    game.School2ID = this.selectedSchool2.ID;
    game.Year = this.year;
    game.GameTime = new Date(year, month, day, this.hour, this.minute);
    game.IsPlayoff = this.isPlayoff;
    game.IsChampionship = this.isChampionship;
    this.svc.addGame(game).subscribe(() => {
      this.addMessage = this.selectedBowl.name + ' Bowl Added!';
    });
    let r = new GameResultModel();
    r.score_1 = 0;
    r.score_2 = 0;

    this.svc.addGameResult(r).subscribe();
  }

  public setSchool(id: string, num: number) {
    if (num === 1) {
      this.selectedSchool1 = this.getSchoolFromID(id);
    } else if (num === 2) {
      this.selectedSchool2 = this.getSchoolFromID(id);
    }
  }

  public getSchoolFromID(id: string): School {
    if (this.schools) {
      if (this.schools) {
        return this.schools.filter(function (school) {
          return school.ID === id;
        })[0];
      }
    }
    return new School();
  }

  public updateStation(station: string) {
    this.selectedStation = station;
  }

  public setBowlGame(id: string | undefined) {
    this.selectedBowl = this.getBowlFromID(id);
  }

  private getBowlFromID(id: string | undefined): Bowl {
    return this.bowls.filter(function (bowl) {
      return bowl.id === id;
    })[0];
  }
}
