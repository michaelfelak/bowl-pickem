import { Component, OnInit, Input, inject } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import {
  Game,
  School,
  PickModel,
  Bowl,
  PickRequest,
  EntryRequest
} from '../shared/services/bowl.model';
import { Title } from '@angular/platform-browser';
import { SkyWaitService } from '@skyux/indicators';
import { SkyAppConfig } from '@skyux/config';
import { mergeMap } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-picks',
  templateUrl: './picks.component.html',
  styleUrls: ['./picks.component.scss']
})
export class PicksComponent implements OnInit {
  public schools: School[] = [];
  private games: Game[] = [];
  private bowls: Bowl[] = [];
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
  public submitted: boolean = false;
  public ncGame1!: string;
  public ncGame2!: string;
  public disableSubmit: boolean = false;
  public showChampionship: boolean = false;
  @Input() public name: string = '';
  @Input() public email: string = '';

  public showError: boolean = false;
  public errorMsg!: string;

  public showSubmitError: boolean = false;
  public submitErrorMsg!: string;

  public tiebreakerPicks: PickModel[] = [];
  @Input() public tiebreaker1: string = 'Select a Game';
  public tiebreaker1Id!: number;
  @Input() public tiebreaker2: number = 0;
  public isLoading: boolean = true;

  pickForm = this.formBuilder.group({
    name: new FormControl(''),
    email: new FormControl(''),
    newpicks: new FormArray([]),
    tiebreaker1Id: new FormControl(0),
    tiebreaker2: new FormControl(0)
  });

  playoffPickForm = this.formBuilder.group({
    playoffPicks: new FormArray([])
  })

  championshipPickForm = this.formBuilder.group({
    championshipPicks: new FormArray([])
  })

  tiebreakerForm = this.formBuilder.group({
    tiebreaker1Id: new FormControl(0),
    tiebreaker2: new FormControl(0)
  })

  get pickFormArray(): FormArray {
    return this.pickForm.get('newpicks') as FormArray;
  }
  get playoffPickFormArray(): FormArray {
    return this.playoffPickForm.get('playoffPicks') as FormArray;
  }
  get championshipPickFormArray(): FormArray {
    return this.championshipPickForm.get('championshipPicks') as FormArray;
  }

  hasChange: boolean = false;

  constructor(
    private svc: BowlService,
    private waitSvc: SkyWaitService,
    private titleService: Title,
    private formBuilder: FormBuilder
  ) { }

  onChanges(): void {
    this.pickForm.valueChanges.subscribe(val => {
      if (!this.isLoading) {
        this.validateBonusPoints();
        this.calculateTotalPoints();
      }
    });
    this.playoffPickForm.valueChanges.subscribe(val => {
      if (!this.isLoading) {
        this.buildChampionshipGame();

        this.validateBonusPoints();
        this.calculateTotalPoints();
      }
    });
    this.championshipPickForm.valueChanges.subscribe(val => {
      if (!this.isLoading) {
        this.validateBonusPoints();
        this.calculateTotalPoints();
      }
    });
    this.tiebreakerForm.valueChanges.subscribe(val => {
      if (!this.isLoading) {
        this.validateBonusPoints();
        this.calculateTotalPoints();
      }
    })

  }

  public ngOnInit() {
    this.onChanges();
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
          this.picks.forEach((pick) => {
            this.pickFormArray.push(this.formBuilder.group({
              team1picked: new FormControl(false),
              team2picked: new FormControl(false),
              points: new FormControl(1),
              team1name: new FormControl(pick.team_1_name),
              team2name: new FormControl(pick.team_2_name),
              gameId: new FormControl(pick.game_id),
            }))
          });

          this.playoffPicks.forEach((pick) => {
            this.playoffPickFormArray.push(this.formBuilder.group({
              team1picked: new FormControl(false),
              team2picked: new FormControl(false),
              points: new FormControl(1),
              team1name: new FormControl(pick.team_1_name),
              team2name: new FormControl(pick.team_2_name),
              gameId: new FormControl(pick.game_id),
              isPlayoff: new FormControl(true),
            }))
          });


          this.allChampionshipPicks.forEach((pick) => {
            this.championshipPickFormArray.push(this.formBuilder.group({
              team1picked: new FormControl(false),
              team2picked: new FormControl(false),
              points: new FormControl(1),
              team1name: new FormControl(pick.team_1_name),
              team2name: new FormControl(pick.team_2_name),
              gameId: new FormControl(pick.game_id),
              isChampionship: new FormControl(true),
            }))
          });

          this.errorMsg = 'get bowl list';
          this.waitSvc.endNonBlockingPageWait();
          this.isLoading = false;
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
    let isTesting = this.pickForm.value.name === 'test' && this.pickForm.value.name === 'test';

    if (!isTesting) {
      if (this.pickForm.value.name === undefined) {
        this.submitErrorMsg = 'You must enter an entry name.';
        this.showSubmitError = true;
        return;
      }
      if (this.pickForm.value.email === undefined) {
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
      if (!this.tiebreakerForm.value.tiebreaker1Id) {
        this.submitErrorMsg = 'Please select the highest-scoring game.';
        this.showSubmitError = true;
        return;
      }
      if (!this.tiebreakerForm.value.tiebreaker2) {
        this.submitErrorMsg =
          'Please enter the number of points that will be scored in the highest-scoring game.';
        this.showSubmitError = true;
        return;
      }

      this.pickFormArray.value.forEach((element: any) => {
        if (element.team1picked === element.team2picked) {
          this.submitErrorMsg = 'Check your picks! You have either missed a game or checked both teams as the winner'
          this.showSubmitError;
        }
      });

      if (this.showSubmitError) {
        return;
      }
    }

    this.showSubmitError = false;
    this.submitErrorMsg = '';
    this.disableSubmit = true;
    let r: EntryRequest = {
      Email: this.pickForm.value.email as string,
      Name: this.pickForm.value.name as string,
      Tiebreaker1: this.tiebreakerForm.value.tiebreaker1Id as number,
      Tiebreaker2: this.tiebreakerForm.value.tiebreaker2 as number,
      IsTesting: isTesting,
      Year: 2023
    };
    this.svc
      .addEntry(r)
      .pipe(
        mergeMap((returnEntryId: string) => {
          let pickRequest = new PickRequest();
          let allPicks: PickModel[] = [];

          this.pickForm.value.newpicks!.forEach((pick: any) => {
            let newPick: PickModel = new PickModel();
            newPick.entry_id = returnEntryId;
            newPick.game_id = pick.gameId;
            newPick.team_1 = pick.team1picked;
            newPick.team_2 = pick.team2picked;
            newPick.points = pick.points;
            newPick.team_1_name = pick.team1name;
            newPick.team_2_name = pick.team2name;
            newPick.game_time = pick.game_time;
            newPick.bowl_name = pick.bowl_name;

            if (pick.team1picked) {
              newPick.picked_school_id = this.getSchoolFromName(
                pick.team1name
              ).ID;
            } else {
              newPick.picked_school_id = this.getSchoolFromName(
                pick.team2name
              ).ID;
            }
            allPicks.push(newPick);
          });

          this.playoffPickForm.value.playoffPicks!.forEach((pick: any) => {
            let newPick: PickModel = new PickModel();
            newPick.entry_id = returnEntryId;
            newPick.game_id = pick.gameId;
            newPick.team_1 = pick.team1picked;
            newPick.team_2 = pick.team2picked;
            newPick.points = pick.points;
            newPick.is_playoff = true;
            newPick.team_1_name = pick.team1name;
            newPick.team_2_name = pick.team2name;
            newPick.game_time = pick.game_time;
            newPick.bowl_name = pick.bowl_name;

            if (pick.team1picked) {
              newPick.picked_school_id = this.getSchoolFromName(
                pick.team1name
              ).ID;
            } else {
              newPick.picked_school_id = this.getSchoolFromName(
                pick.team2name
              ).ID;
            }
            allPicks.push(newPick);
          });
          this.championshipPickForm.value.championshipPicks!.forEach((pick: any) => {
            let newPick: PickModel = new PickModel();
            newPick.entry_id = returnEntryId;
            newPick.game_id = pick.gameId;
            newPick.team_1 = pick.team1picked;
            newPick.team_2 = pick.team2picked;
            newPick.points = pick.points;
            newPick.is_championship = true;
            newPick.team_1_name = pick.team1name;
            newPick.team_2_name = pick.team2name;
            newPick.game_time = pick.game_time;
            newPick.bowl_name = pick.bowl_name;

            if (pick.team1picked) {
              newPick.picked_school_id = this.getSchoolFromName(
                pick.team1name
              ).ID;
            } else {
              newPick.picked_school_id = this.getSchoolFromName(
                pick.team2name
              ).ID;
            }
            allPicks.push(newPick);
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
        this.name = this.pickForm.value.name as string;
        this.email = this.pickForm.value.email as string;
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
        p.game_time = dayjs(game.GameTime).format('MM/DD/YYYY hh:mm:ss');
        p.is_new_years_game = this.isBonusGame(game, bowl.name);
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

    if (this.playoffPickFormArray.value[0].team1picked && this.playoffPickFormArray.value[1].team1picked) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPickFormArray.value[0].team1name,
          this.playoffPickFormArray.value[1].team1name
        )
      );
      this.resetPicks(0, 2, 3);
    } else if (this.playoffPickFormArray.value[0].team1picked && this.playoffPickFormArray.value[1].team2picked) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPickFormArray.value[0].team1name,
          this.playoffPickFormArray.value[1].team2name
        )
      );
      this.resetPicks(1, 2, 3);
    } else if (this.playoffPickFormArray.value[0].team2picked && this.playoffPickFormArray.value[1].team2picked) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPickFormArray.value[0].team2name,
          this.playoffPickFormArray.value[1].team2name
        )
      );
      this.resetPicks(0, 1, 2);
    } else if (this.playoffPickFormArray.value[0].team2picked && this.playoffPickFormArray.value[1].team1picked) {
      this.championshipPicks.push(
        this.getChampionshipGame(
          this.playoffPickFormArray.value[0].team2name,
          this.playoffPickFormArray.value[1].team1name
        )
      );
      this.resetPicks(0, 1, 3);
    } else {
    }

    let game1selected: boolean =
      this.playoffPickFormArray.value[0].team1picked || this.playoffPickFormArray.value[0].team2picked;
    let game2selected: boolean =
      this.playoffPickFormArray.value[1].team1picked || this.playoffPickFormArray.value[1].team2picked;

    this.showChampionship = game1selected && game2selected;
  }

  public validatePicks(): boolean {
    if (this.pickForm.value.name === 'test' && this.pickForm.value.email === 'test') {
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
    let threePointGames = this.pickFormArray.value.filter(function (pick: any) {
      return pick.points === 3;
    });

    let threePointPlayoffGames = this.playoffPickFormArray.value.filter(function (pick: any) {
      return pick.points === 3;
    });

    let threePointChampionshipGames = this.championshipPickFormArray.value.filter(function (
      pick: any
    ) {
      return pick.points === 3;
    });

    let fivePointGames = this.pickFormArray.value.filter(function (pick: any) {
      return pick.points === 5;
    });

    let tenPointGames = this.pickFormArray.value.filter(function (pick: any) {
      return pick.points === 10;
    });

    let fivePointPlayoffGames = this.playoffPickFormArray.value.filter(function (pick: any) {
      return pick.points === 5;
    });

    let fivePointChampionshipGames = this.championshipPickFormArray.value.filter(function (
      pick: any
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
    this.pickFormArray.value.forEach((pick: any) => {
      if (pick && pick.team1picked || pick.team2picked) {
        totalPoints += pick.points;
      }
    });
    this.championshipPickFormArray.value.forEach((pick: any) => {
      if (pick && pick.team1picked || pick.team2picked) {
        totalPoints += pick.points;
      }
    });
    this.playoffPickFormArray.value.forEach((pick: any) => {
      if (pick && pick.team1picked || pick.team2picked) {
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

  private isBonusGame(game: Game, name: string): boolean {
    let bonusGameNames = [
      'Military',
      'Mayo',
      'Holiday',
      'Texas',
      'Fenway',
      'Pinstripe',
      'Pop-Tarts',
      'Alamo'
    ];

    // this is if there are bowl games on new years day
    // return dayjs(game.GameTime).date() === 1;

    // use this if new years day is on a sunday and there are no games
    return bonusGameNames.includes(name);
  }
}
