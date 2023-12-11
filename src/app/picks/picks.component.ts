import { Component, OnInit, Input } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import {
  Game,
  School,
  PickModel,
  Bowl,
  PickRequest,
  EntryRequest
} from '../shared/services/bowl.model';
// import * as moment from 'moment';
import { Title } from '@angular/platform-browser';
import { SkyWaitService } from '@skyux/indicators';
import { SkyAppConfig } from '@skyux/config';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-picks',
  templateUrl: './picks.component.html',
  styleUrls: ['./picks.component.scss']
})
export class PicksComponent implements OnInit {
  public schools!: School[];
  private games!: Game[];
  private bowls!: Bowl[];
  @Input() public picks: PickModel[] = [];
  @Input() public allPicks: PickModel[] = [];
  public playoffPicks: PickModel[] = [];
  public championshipPicks: PickModel[] = [];
  public allChampionshipPicks: PickModel[] = [];
  public pointValues: number[] = [1, 3, 5];
  public newYearsPointValues: number[] = [1, 3, 5, 10];
  public threePointError: boolean = false;
  public fivePointError: boolean = false;
  public tenPointError: boolean = false;
  public maxThreePointGames: number = 5;
  public maxFivePointGames: number = 5;
  public maxTenPointGames: number = 1;
  public threePointGames: number = 0;
  public fivePointGames: number = 0;
  public tenPointGames: number = 0;
  @Input() public name!: string;
  @Input() public email!: string;
  public submitted: boolean = false;
  public ncGame1!: string;
  public ncGame2!: string;
  public disableSubmit: boolean = false;
  public showChampionship: boolean = false;

  public showError: boolean = false;
  public errorMsg!: string;

  public showSubmitError: boolean = false;
  public submitErrorMsg!: string;

  public tiebreakerPicks: PickModel[] = [];
  @Input() public tiebreaker1: string = 'Select a Game';
  public tiebreaker1Id!: number;
  @Input() public tiebreaker2: number = 0;

  constructor(
    private svc: BowlService,
    private waitSvc: SkyWaitService,
    private titleService: Title,
    private config: SkyAppConfig
  ) { }

  public ngOnInit() {
    this.titleService.setTitle("Bowl Pick'em - Submit Entry");
    this.waitSvc.beginNonBlockingPageWait();

    // get schools, games, and bowls to make up the list
    this.svc
      .getSchools()
      .pipe(
        mergeMap((result: School[]) => {
          this.schools = result;
          this.errorMsg = 'get schools';
          return this.svc.getGames('2023');
        }),
        mergeMap((result: Game[]) => {
          this.games = result;
          this.sortByDate();
          this.errorMsg = 'get games';
          return this.svc.getBowlList();
        })
      )
      .subscribe(
        (result: Bowl[]) => {
          this.bowls = result;
          this.buildPicks();
          this.errorMsg = 'get bowl list';
          this.waitSvc.endNonBlockingPageWait();
        },
        (err: Error) => {
          this.errorMsg =
            'An error occurred, please e-mail toastysolutions@gmail.com to inform us of the outage: ' +
            this.errorMsg;
          this.showError = true;
        }
      );
  }

  public submit() {
    let isTesting = this.name === 'test' && this.email === 'test';

    if (this.name === undefined) {
      this.submitErrorMsg = 'You must enter an entry name.';
      this.showSubmitError = true;
      return;
    }
    if (this.email === undefined) {
      this.submitErrorMsg = 'You must enter an e-mail address.';
      this.showSubmitError = true;
      return;
    }
    if (this.allChampionshipPicks && !this.showChampionship) {
      this.submitErrorMsg =
        'You must select the winners of the championship game.';
      this.showSubmitError = true;
      return;
    }
    if (!this.validatePicks()) {
      this.submitErrorMsg = 'You must make a selection for each bowl game.';
      this.showSubmitError = true;
    }
    if (this.threePointError) {
      this.submitErrorMsg = 'You have too many 3 point games selected.';
      this.showSubmitError = true;
      return;
    }
    if (this.fivePointError) {
      this.submitErrorMsg = 'You have too many 5 point games selected.';
      this.showSubmitError = true;
      return;
    }
    if (this.tenPointError) {
      this.submitErrorMsg = 'You have too many 10 point games selected.';
      this.showSubmitError = true;
      return;
    }
    if (!this.tiebreaker1Id) {
      this.submitErrorMsg = 'Please select the highest-scoring game.';
      this.showSubmitError = true;
      return;
    }
    if (!this.tiebreaker2) {
      this.submitErrorMsg =
        'Please enter the number of points that will be scored in the highest-scoring game.';
      this.showSubmitError = true;
      return;
    }

    this.showSubmitError = false;
    this.submitErrorMsg = '';
    this.disableSubmit = true;
    let r: EntryRequest = {
      Email: this.email,
      Name: this.name,
      Tiebreaker1: this.tiebreaker1Id,
      Tiebreaker2: this.tiebreaker2,
      IsTesting: isTesting,
      Year: this.config.skyux.appSettings.currentYear
    };
    this.svc
      .addEntry(r)
      .pipe(
        mergeMap((returnEntryId: string) => {
          let pickRequest = new PickRequest();
          let allPicks: PickModel[] = [];
          this.picks.forEach((pick: PickModel) => {
            if (pick.team_1) {
              pick.picked_school_id = this.getSchoolFromName(
                pick.team_1_name
              ).ID;
            } else {
              pick.picked_school_id = this.getSchoolFromName(
                pick.team_2_name
              ).ID;
            }
            pick.entry_id = returnEntryId;
            allPicks.push(pick);
          });
          this.playoffPicks.forEach((pick: PickModel) => {
            if (pick.team_1) {
              pick.picked_school_id = this.getSchoolFromName(
                pick.team_1_name
              ).ID;
            } else {
              pick.picked_school_id = this.getSchoolFromName(
                pick.team_2_name
              ).ID;
            }
            pick.entry_id = returnEntryId;
            allPicks.push(pick);
          });
          this.championshipPicks.forEach((pick: PickModel) => {
            if (pick.team_1) {
              pick.picked_school_id = this.getSchoolFromName(
                pick.team_1_name
              ).ID;
            } else {
              pick.picked_school_id = this.getSchoolFromName(
                pick.team_2_name
              ).ID;
            }
            if (pick.team_1 !== pick.team_2) {
              pick.entry_id = returnEntryId;
              allPicks.push(pick);
            }
          });
          pickRequest.picks = allPicks;
          this.allPicks = allPicks;
          return this.svc.submit(pickRequest);
        })
      )
      .subscribe((pickresult: any) => {
        this.calculateTotalPoints();
        this.disableSubmit = false;
        this.submitted = true;
      });
  }

  public buildPicks() {
    if (this.games && this.bowls) {
      this.games.forEach((game: Game) => {
        let p: PickModel = new PickModel();
        p.game_id = game.ID;
        p.team_1_name = this.getSchoolFromID(game.School1ID);
        p.team_2_name = this.getSchoolFromID(game.School2ID);
        let bowl = this.getBowlFromID(game.BowlID);
        p.team_1 = false;
        p.team_2 = false;
        p.bowl_name = bowl.name;
        // p.game_time = moment(game.GameTime).format('MM/DD/YYYY hh:mm:ss');
        p.is_new_years_day = this.isNewYearsDayGame(game, bowl.name);
        p.points = 1;
        p.is_playoff = game.IsPlayoff;
        p.is_championship = game.IsChampionship;
        if (p.is_playoff) {
          this.playoffPicks.push(p);
        } else if (p.is_championship) {
          this.allChampionshipPicks.push(p);
        } else {
          this.picks.push(p);
        }
        this.tiebreakerPicks.push(p);
      });
    }
  }

  public toggleAll() {
    this.picks.forEach((pick: PickModel) => {
      if (!pick.is_championship) {
        pick.team_1 = true;
      }
    });
  }

  public sortChampionshipPicks() {
    if (this.allChampionshipPicks) {
      this.allChampionshipPicks.sort((a: PickModel, b: PickModel) => {
        return +new Date(a.game_id) - +new Date(b.game_id);
      });
    }
  }

  public buildChampionshipGame() {
    this.championshipPicks = [];
    this.sortChampionshipPicks();

    if (this.playoffPicks[0].team_1 && this.playoffPicks[1].team_1) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPicks[0].team_1_name,
          this.playoffPicks[1].team_1_name
        )
      );
      this.resetPicks(0, 2, 3);
    } else if (this.playoffPicks[0].team_1 && this.playoffPicks[1].team_2) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPicks[0].team_1_name,
          this.playoffPicks[1].team_2_name
        )
      );
      this.resetPicks(1, 2, 3);
    } else if (this.playoffPicks[0].team_2 && this.playoffPicks[1].team_2) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPicks[0].team_2_name,
          this.playoffPicks[1].team_2_name
        )
      );
      this.resetPicks(0, 1, 2);
    } else if (this.playoffPicks[0].team_2 && this.playoffPicks[1].team_1) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPicks[0].team_2_name,
          this.playoffPicks[1].team_1_name
        )
      );
      this.resetPicks(0, 1, 3);
    } else {
    }

    let game1selected: boolean =
      this.playoffPicks[0].team_1 || this.playoffPicks[0].team_2;
    let game2selected: boolean =
      this.playoffPicks[1].team_1 || this.playoffPicks[1].team_2;

    this.showChampionship = game1selected && game2selected;

    console.log(this.championshipPicks);
  }

  public validatePicks(): boolean {
    if (this.name === 'test' && this.email === 'test') {
      return true;
    }
    let isValid: boolean = true;
    this.picks.forEach((pick: PickModel) => {
      if (pick.team_1 === pick.team_2) {
        isValid = false;
      }
    });
    this.playoffPicks.forEach((pick: PickModel) => {
      if (pick.team_1 === pick.team_2) {
        isValid = false;
      }
    });
    let gamesPicked = 0;
    this.allChampionshipPicks.forEach((pick: PickModel) => {
      if (pick.team_1 !== pick.team_2) {
        gamesPicked += 1;
      }
    });
    if (gamesPicked !== 1) {
      isValid = false;
    }
    return isValid;
  }

  public getBowlFromID(id: string | undefined): Bowl {
    return this.bowls.filter(function (bowl) {
      return bowl.id === id;
    })[0];
  }

  public getSchoolFromID(id: string): string {
    let schools = this.schools.filter(function (school) {
      return school.ID === id;
    });
    if (schools) {
      return schools[0].Name;
    }
    return "";
  }

  public getSchoolFromName(name: string): School {
    let schools = this.schools.filter(function (school) {
      return school.Name === name;
    });
    if (schools) {
      return schools[0];
    }
    return new School();
  }

  public updatePoints(id: string, points: number, type: number) {
    let item = this.getPickFromId(id, type);
    item.points = points;

    // calculate total points
    this.validateBonusPoints();
    this.calculateTotalPoints();
  }

  public updateSelection(gameId: string, i: number, type: number) {
    let pick = this.getPickFromId(gameId, type);
    if (i === 1) {
      if (pick.team_2) {
        pick.team_2 = false;
      }
    }
    if (i === 2) {
      if (pick.team_1) {
        pick.team_1 = false;
      }
    }

    if (type === 1) {
      this.buildChampionshipGame();
    }
  }

  // only allow a certain amount of 3/5 point games
  public validateBonusPoints(): boolean {
    let threePointGames = this.picks.filter(function (pick) {
      return pick.points === 3;
    });

    let threePointPlayoffGames = this.playoffPicks.filter(function (pick) {
      return pick.points === 3;
    });

    let threePointChampionshipGames = this.championshipPicks.filter(function (
      pick
    ) {
      return pick.points === 3;
    });

    let fivePointGames = this.picks.filter(function (pick) {
      return pick.points === 5;
    });

    let tenPointGames = this.picks.filter(function (pick) {
      return pick.points === 10;
    });

    let fivePointPlayoffGames = this.playoffPicks.filter(function (pick) {
      return pick.points === 5;
    });

    let fivePointChampionshipGames = this.championshipPicks.filter(function (
      pick
    ) {
      return pick.points === 5;
    });

    let allThreePointGamesLength =
      threePointGames.length +
      threePointPlayoffGames.length +
      threePointChampionshipGames.length;
    let allFivePointGamesLength =
      fivePointGames.length +
      fivePointPlayoffGames.length +
      fivePointChampionshipGames.length;
    let allTenPointGamesLength = tenPointGames.length;

    if (allThreePointGamesLength > this.maxThreePointGames) {
      this.threePointError = true;
    } else {
      this.threePointError = false;
    }
    this.threePointGames = allThreePointGamesLength;

    if (allFivePointGamesLength > this.maxFivePointGames) {
      this.fivePointError = true;
    } else {
      this.fivePointError = false;
    }
    this.fivePointGames = allFivePointGamesLength;

    if (allTenPointGamesLength > this.maxTenPointGames) {
      this.tenPointError = true;
    } else {
      this.tenPointError = false;
    }
    this.tenPointGames = allTenPointGamesLength;

    return this.threePointError || this.fivePointError || this.tenPointError;
  }

  // reset all picks to none
  public clear() {
    this.picks.filter(function (pick) {
      pick.team_1 = false;
      pick.team_2 = false;
      pick.points = 1;
    });
    this.fivePointError = false;
    this.threePointError = false;
    this.threePointGames = 0;
    this.fivePointGames = 0;
    this.showSubmitError = false;
  }

  public calculateTotalPoints(): number {
    let totalPoints = 0;
    this.picks.forEach((pick: PickModel) => {
      if (pick.team_1 || pick.team_2) {
        totalPoints += pick.points;
      }
    });
    this.championshipPicks.forEach((pick: PickModel) => {
      if (pick && (pick.team_1 || pick.team_2)) {
        totalPoints += pick.points;
      }
    });
    this.playoffPicks.forEach((pick: PickModel) => {
      if (pick && (pick.team_1 || pick.team_2)) {
        totalPoints += pick.points;
      }
    });
    return totalPoints;
  }

  public selectTiebreaker1(gameId: string) {
    let pick = this.getPickFromId(gameId, 0);
    this.tiebreaker1 = pick.team_1_name + ' vs. ' + pick.team_2_name;
    this.tiebreaker1Id = +gameId;
  }

  private getPickFromId(gameId: string, type: number): PickModel {
    return this.tiebreakerPicks.filter(function (pick) {
      return pick.game_id === gameId;
    })[0];
  }

  private sortByDate() {
    if (this.games) {
      this.games.sort((a: Game, b: Game) => {
        return +new Date(a.GameTime) - +new Date(b.GameTime);
      });
    }
  }

  private resetPicks(id1: number, id2: number, id3: number) {
    this.allChampionshipPicks[id1].team_1 = false;
    this.allChampionshipPicks[id1].team_2 = false;
    this.allChampionshipPicks[id1].points = 1;
    this.allChampionshipPicks[id2].team_1 = false;
    this.allChampionshipPicks[id2].team_2 = false;
    this.allChampionshipPicks[id2].points = 1;
    this.allChampionshipPicks[id3].team_1 = false;
    this.allChampionshipPicks[id3].team_2 = false;
    this.allChampionshipPicks[id3].points = 1;
  }

  private getChampionshipGame(team1name: string, team2name: string): PickModel {
    let picks = this.allChampionshipPicks.find((game) => {
      return (
        (game.team_1_name === team1name && game.team_2_name === team2name) ||
        (game.team_1_name === team2name && game.team_2_name === team1name)
      );
    });

    if (picks) {
      return picks;
    }
    else { return new PickModel }
  }

  private isNewYearsDayGame(game: Game, name: string): boolean {
    let newYearsGameNames = [
      'Rose',
      'ReliaQuest',
      'Citrus',
      'Cotton',
      'Sugar',
      'Orange'
    ];

    // this is if there are bowl games on new years day
    // return moment(game.GameTime).dayOfYear() === 1;

    // use this if new years day is on a sunday and there are no games
    return newYearsGameNames.includes(name);
  }
}
