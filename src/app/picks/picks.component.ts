import { Component, OnInit, Input } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import {
  Game,
  School,
  PickModel,
  Bowl,
  EntryRequest,
  PickRequest,
  PlayoffSchool,
} from '../shared/services/bowl.model';
import { Title } from '@angular/platform-browser';
import { SkyAlertModule, SkyWaitService } from '@skyux/indicators';
import { mergeMap } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import {
  FormControl,
  FormBuilder,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { PicksCompletedComponent } from './picks-completed/picks-completed.component';
import { PickSummaryComponent } from './pick-summary/pick-summary.component';
import { CommonModule } from '@angular/common';
import { SkyCheckboxModule, SkyInputBoxModule } from '@skyux/forms';
import { SettingsService } from '../shared/services/settings.service';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { SubmissionConfirmationComponent } from './submission-confirmation/submission-confirmation.component';

@Component({
  standalone: true,
  selector: 'app-picks',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PicksCompletedComponent,
    PickSummaryComponent,
    SkyAlertModule,
    SkyCheckboxModule,
    SkyInputBoxModule,
    SubmissionConfirmationComponent,
  ],
  providers: [SettingsService],
  templateUrl: './picks.component.html',
  styleUrls: ['./picks.component.scss'],
})
export class PicksComponent implements OnInit {
  public schools: School[] = [];
  public playoffSchools: PlayoffSchool[] = [];
  public playoffSchoolsA: PlayoffSchool[] = [];
  public playoffSchoolsB: PlayoffSchool[] = [];
  private games: Game[] = [];
  private bowls: Bowl[] = [];
  @Input() public picks: PickModel[] = [];
  @Input() public allPicks: PickModel[] = [];
  public pointValues: number[] = [1, 3, 5];
  public newYearsPointValues: number[] = [1, 3, 5, 10];
  public threePointError = false;
  public fivePointError = false;
  public tenPointError = false;
  public maxThreePointGames = 5;
  public maxFivePointGames = 5;
  public maxTenPointGames = 1;
  public threePointGames = 0;
  public fivePointGames = 0;
  public tenPointGames = 0;
  public submitted = false;
  public disableSubmit = false;
  @Input() public name = '';
  public email = '';
  public isAuthenticated = false;
  public showRulesSection = false;
  public gamesPicked = 0;
  public totalGames = 0;

  public showError = false;
  public errorMsg!: string;

  public showSubmitError = false;
  public submitErrorMsg!: string;

  public tiebreakerPicks: PickModel[] = [];
  @Input() public tiebreaker1 = 'Select a Game';
  public tiebreaker1Id!: number;
  @Input() public tiebreaker2 = 0;
  public isLoading = true;

  public showConfirmation = false;
  public confirmationData: any = null;
  private pendingSubmission: any = null;

  private championshipGameError: boolean = false;
  private championError: boolean = true;

  pickForm = this.formBuilder.group({
    name: new FormControl(''),
    newpicks: new FormArray([]),
    tiebreaker1Id: new FormControl(0),
    tiebreaker2: new FormControl(0),
    playoff1: new FormControl(0),
    playoff2: new FormControl(0),
    champion: new FormControl(0),
  });

  tiebreakerForm = this.formBuilder.group({
    tiebreaker1Id: new FormControl(0),
    tiebreaker2: new FormControl(0),
  });

  get pickFormArray(): FormArray {
    return this.pickForm.get('newpicks') as FormArray;
  }

  hasChange = false;

  constructor(
    private svc: BowlService,
    private waitSvc: SkyWaitService,
    private titleService: Title,
    private formBuilder: FormBuilder,
    private settings: SettingsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  onChanges(): void {
    this.pickForm.valueChanges.subscribe(() => {
      if (!this.isLoading) {
        this.validateBonusPoints();
        this.validateChampionship();
        this.calculateTotalPoints();
        this.countGamesPicked();
      }
    });
    this.tiebreakerForm.valueChanges.subscribe(() => {
      if (!this.isLoading) {
        this.validateBonusPoints();
        this.validateChampionship();
        this.calculateTotalPoints();
      }
    });
  }

  public countGamesPicked(): void {
    this.gamesPicked = 0;
    this.pickFormArray.value.forEach((pick: any) => {
      if (pick.team1picked || pick.team2picked) {
        this.gamesPicked++;
      }
    });
  }

  public ngOnInit() {
    this.onChanges();
    this.titleService.setTitle("Bowl Pick'em - Submit Entry");
    this.waitSvc.beginNonBlockingPageWait();

    // Get email from authenticated user
    if (this.authService.isAuthenticated()) {
      const cachedEmail = this.authService.getCurrentUserEmail();
      if (cachedEmail) {
        this.email = cachedEmail;
      } else {
        // Try to fetch from backend if not in cache
        this.authService.fetchAndCacheUserEmail().subscribe(
          (email) => {
            this.email = email;
          },
          () => {
            // If fetching fails, the getCurrentUserEmail already checks cache
            this.email = this.authService.getCurrentUserEmail() || '';
          }
        );
      }
    }

    this.svc
      .getPlayoffSchools(this.settings.currentYear)
      .subscribe((result) => {
        const leftSeeds = [1, 4, 5, 12, 8, 9];
        const rightSeeds = [2, 3, 6, 7, 10, 11];
        this.playoffSchools = result.sort(
          (a: PlayoffSchool, b: PlayoffSchool) => {
            return a.seed_number! > b.seed_number! ? 1 : -1;
          }
        );

        this.playoffSchoolsA = this.playoffSchools.filter((x) => {
          return leftSeeds.indexOf(x.seed_number) > -1;
        });
        this.playoffSchoolsB = this.playoffSchools.filter((x) => {
          return rightSeeds.indexOf(x.seed_number) > -1;
        });
      });
    this.validateChampionship();

    // get schools, games, and bowls to make up the list
    this.svc
      .getSchools()
      .pipe(
        mergeMap((result: School[]) => {
          this.schools = result;
          this.errorMsg = 'get schools';
          return this.svc.getGames(this.settings.currentYear);
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
            this.pickFormArray.push(
              this.formBuilder.group({
                team1picked: new FormControl(false),
                team2picked: new FormControl(false),
                points: new FormControl(1),
                team1name: new FormControl(pick.team_1_name),
                team2name: new FormControl(pick.team_2_name),
                gameId: new FormControl(pick.game_id),
                gameTime: new FormControl(pick.game_time),
                bowlName: new FormControl(pick.bowl_name),
              })
            );
          });

          // Set total games after picks are loaded
          this.totalGames = this.picks.length;
          this.countGamesPicked();

          // this.allChampionshipPicks.forEach((pick) => {
          //   this.championshipPickFormArray.push(
          //     this.formBuilder.group({
          //       team1picked: new FormControl(false),
          //       team2picked: new FormControl(false),
          //       points: new FormControl(1),
          //       team1name: new FormControl(pick.team_1_name),
          //       team2name: new FormControl(pick.team_2_name),
          //       gameId: new FormControl(pick.game_id),
          //       isChampionship: new FormControl(true),
          //       gameTime: new FormControl(pick.game_time),
          //       bowlName: new FormControl(pick.bowl_name),
          //     })
          //   );
          // });

          this.errorMsg = 'get bowl list';
          this.waitSvc.endNonBlockingPageWait();
          this.isLoading = false;
        },
        () => {
          this.errorMsg =
            'An error occurred, please e-mail toastysolutions@gmail.com to inform us of the outage: ' +
            this.errorMsg;
          this.showError = true;
        }
      );
  }

  public selectAllTeam2() {
    this.pickFormArray.value.forEach((pick: any) => {
      pick.team2picked = true;
    });
  }

  public submit() {
    const isTesting = this.pickForm.value.name === 'test';

    this.showSubmitError = false;
    this.submitErrorMsg = '';
    if (!isTesting) {
      if (!this.pickForm.value.name) {
        this.submitErrorMsg = 'You must enter an entry name.';
        this.showSubmitError = true;
        return;
      }
      if (!this.email || this.email.indexOf('@') === -1) {
        this.submitErrorMsg =
          'You must be logged in with a valid email address.';
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
      if (this.championshipGameError) {
        this.submitErrorMsg =
          'Select two teams to play in the championship game.';
        this.showSubmitError = true;
      }
      if (this.championError) {
        this.submitErrorMsg = 'Select the national champion.';
        this.showSubmitError = true;
      }

      this.pickFormArray.value.forEach((element: any) => {
        if (element.team1picked === element.team2picked) {
          this.submitErrorMsg =
            'Check your picks! You have either missed a game or checked both teams as the winner';
          this.showSubmitError = true;
        }
      });

      if (this.showSubmitError) {
        return;
      }
    }

    // All validation passed, show confirmation dialog
    this.showConfirmationDialog();
  }

  private showConfirmationDialog(): void {
    const threePointGames = this.getBonusGames(3);
    const fivePointGames = this.getBonusGames(5);
    const tenPointGames = this.getBonusGames(10);

    // Get championship school names from form values
    const playoff1Id = this.pickForm.value.playoff1;
    const playoff2Id = this.pickForm.value.playoff2;
    const championId = this.pickForm.value.champion;

    const playoff1School = this.playoffSchools.find(s => s.school_id === playoff1Id);
    const playoff2School = this.playoffSchools.find(s => s.school_id === playoff2Id);
    const championSchool = this.playoffSchools.find(s => s.school_id === championId);

    this.confirmationData = {
      entryName: this.pickForm.value.name,
      totalPossiblePoints: this.calculateTotalPoints(),
      threePointGames: threePointGames,
      fivePointGames: fivePointGames,
      tenPointGames: tenPointGames,
      allGamesPicked: this.gamesPicked === this.totalGames,
      totalGamesPicked: this.gamesPicked,
      totalGames: this.totalGames,
      championshipParticipant1: playoff1School?.school_name,
      championshipParticipant2: playoff2School?.school_name,
      champion: championSchool?.school_name,
      onConfirm: () => this.confirmSubmission(),
      onCancel: () => this.cancelSubmission(),
    };

    this.showConfirmation = true;
  }

  private getBonusGames(points: number): PickModel[] {
    const bonusGames: PickModel[] = [];
    this.pickFormArray.controls.forEach((control, index) => {
      if (
        control.get('points')?.value === points &&
        index < this.picks.length
      ) {
        const pick = this.picks[index];
        if (pick) {
          bonusGames.push(pick);
        }
      }
    });
    return bonusGames;
  }

  private confirmSubmission(): void {
    this.showConfirmation = false;
    this.performActualSubmission();
  }

  private cancelSubmission(): void {
    this.showConfirmation = false;
  }

  private performActualSubmission(): void {
    const isTesting = this.pickForm.value.name === 'test';
    this.disableSubmit = true;
    const userId = this.authService.getCurrentUserId();
    const r: EntryRequest = {
      email: this.email,
      user_id: userId || undefined,
      name: this.pickForm.value.name as string,
      tiebreaker_1: this.tiebreakerForm.value.tiebreaker1Id as number,
      tiebreaker_2: this.tiebreakerForm.value.tiebreaker2 as number,
      testing: isTesting,
      year: this.settings.currentYear,
    };

    let entryId: string;
    this.svc
      .addEntry(r)
      .pipe(
        mergeMap((returnEntryId: string) => {
          entryId = returnEntryId;
          const allPicks: PickModel[] = [];

          this.pickForm.value.newpicks!.forEach((pick: any) => {
            const newPick: PickModel = {};
            newPick.entry_id = returnEntryId;
            newPick.game_id = pick.gameId;
            newPick.team_1_picked = pick.team1picked;
            newPick.team_2_picked = pick.team2picked;
            newPick.points = pick.points;
            newPick.team_1_name = pick.team1name;
            newPick.team_2_name = pick.team2name;
            newPick.game_time = pick.gameTime;
            newPick.bowl_name = pick.bowlName;

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

          const pickRequest: PickRequest = {
            entry_id: returnEntryId,
            picks: allPicks,
          };
          
          this.allPicks = allPicks;
          return this.svc.submit(pickRequest);
        }),
        mergeMap(() => {
          // submit playoff picks
          return this.svc.addPlayoffPicks({
            playoff_picks: [
              {
                entry_id: entryId.toString(),
                school1_id: Number(this.pickForm.value.playoff1!),
                school2_id: Number(this.pickForm.value.playoff2!),
                champion_school_id: Number(this.pickForm.value.champion!),
              },
            ],
          });
        })
      )
      .subscribe(() => {
        this.calculateTotalPoints();
        this.disableSubmit = false;
        this.submitted = true;
        this.name = this.pickForm.value.name as string;
        this.picks = this.allPicks;
      });
  }

  public buildPicks() {
    if (this.games && this.bowls) {
      this.games.forEach((game: Game) => {
        const p: PickModel = {};
        p.game_id = game.ID;
        p.team_1_name = this.getSchoolFromID(game.School1ID!);
        p.team_2_name = this.getSchoolFromID(game.School2ID!);
        const bowl = this.getBowlFromID(game.BowlID);
        p.team_1_picked = false;
        p.team_2_picked = false;
        p.bowl_name = bowl.name;
        p.game_time = dayjs(game.GameTime).format('MM/DD/YYYY hh:mm:ss');
        p.is_new_years_game = this.isBonusGame(game, bowl.name!);
        p.points = 1;
        p.is_playoff = game.IsPlayoff;
        p.is_championship = game.IsChampionship;
        this.picks.push(p);
        this.tiebreakerPicks.push(p);
      });
    }
  }

  public toggleAll() {
    this.picks.forEach((pick: PickModel) => {
      if (!pick.is_championship) {
        pick.team_1_picked = true;
      }
    });
  }

  public validatePicks(): boolean {
    if (this.pickForm.value.name === 'test' && this.email === 'test') {
      return true;
    }
    let isValid = true;
    this.pickFormArray.value.forEach((pick: any) => {
      if (pick.team1picked === pick.team2picked) {
        isValid = false;
      }
    });
    return isValid;
  }

  public isFormValid(): boolean {
    const isTesting = this.pickForm.value.name === 'test';

    if (isTesting) {
      return true;
    }

    if (!this.pickForm.value.name) {
      return false;
    }

    if (!this.email || this.email.indexOf('@') === -1) {
      return false;
    }

    if (!this.validatePicks()) {
      return false;
    }

    if (this.threePointError || this.fivePointError || this.tenPointError) {
      return false;
    }

    if (this.championshipGameError || this.championError) {
      return false;
    }

    if (!this.tiebreakerForm.value.tiebreaker2) {
      return false;
    }

    return true;
  }

  public getBowlFromID(id: string | undefined): Bowl {
    return this.bowls.filter(function (bowl) {
      return bowl.id === id;
    })[0];
  }

  public getSchoolFromID(id: string): string {
    const schools = this.schools.filter(function (school) {
      return school.ID === id;
    });
    if (schools) {
      return schools[0]?.Name ?? '';
    }
    return '';
  }

  public getSchoolFromName(name?: string): School {
    const schools = this.schools.filter(function (school) {
      return school.Name === name;
    });
    if (schools) {
      return schools[0];
    }
    return {} as School;
  }

  public updatePoints(id: string, points: number) {
    const item = this.getPickFromId(id);
    item.points = points;

    // calculate total points
    this.validateBonusPoints();
    this.calculateTotalPoints();
  }

  public updateSelection(gameId?: string, teamNumber?: number) {
    // Find the index of the pick in the form array
    const pickIndex = this.pickFormArray.controls.findIndex((control) => {
      return control.get('gameId')?.value === gameId;
    });

    if (pickIndex === -1) return;

    const pickGroup = this.pickFormArray.at(pickIndex);

    if (teamNumber === 1) {
      // If team 1 is being selected, deselect team 2
      if (pickGroup.get('team1picked')?.value) {
        pickGroup.get('team2picked')?.setValue(false);
      }
    } else if (teamNumber === 2) {
      // If team 2 is being selected, deselect team 1
      if (pickGroup.get('team2picked')?.value) {
        pickGroup.get('team1picked')?.setValue(false);
      }
    }
  }

  public validateChampionship() {
    if (!this.pickForm.value.playoff1 || !this.pickForm.value.playoff2) {
      this.championshipGameError = true;
      this.championError = false;
    } else if (!this.pickForm.value.champion) {
      this.championshipGameError = false;
      this.championError = true;
    } else {
      this.championError = false;
      this.championshipGameError = false;
    }
  }

  // only allow a certain amount of 3/5 point games
  public validateBonusPoints(): boolean {
    const threePointGames = this.pickFormArray.value.filter(function (
      pick: any
    ) {
      return pick.points === 3;
    });

    // const threePointPlayoffGames = this.playoffPickFormArray.value.filter(
    //   function (pick: any) {
    //     return pick.points === 3;
    //   }
    // );

    // const threePointChampionshipGames =
    //   this.championshipPickFormArray.value.filter(function (pick: any) {
    //     return pick.points === 3;
    //   });

    const fivePointGames = this.pickFormArray.value.filter(function (
      pick: any
    ) {
      return pick.points === 5;
    });

    const tenPointGames = this.pickFormArray.value.filter(function (pick: any) {
      return pick.points === 10;
    });

    // const fivePointPlayoffGames = this.playoffPickFormArray.value.filter(
    //   function (pick: any) {
    //     return pick.points === 5;
    //   }
    // );

    // const fivePointChampionshipGames =
    //   this.championshipPickFormArray.value.filter(function (pick: any) {
    //     return pick.points === 5;
    //   });

    const allThreePointGamesLength = threePointGames.length;
    //  +
    // threePointPlayoffGames.length +
    // threePointChampionshipGames.length;
    const allFivePointGamesLength = fivePointGames.length;
    //  +
    // fivePointPlayoffGames.length +
    // fivePointChampionshipGames.length;
    const allTenPointGamesLength = tenPointGames.length;

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
    // Clear all pick selections and reset points to 1
    this.pickFormArray.controls.forEach((control) => {
      control.patchValue({
        team1picked: false,
        team2picked: false,
        points: 1,
      });
    });

    // Clear playoff and champion selections
    this.pickForm.get('playoff1')?.setValue(0);
    this.pickForm.get('playoff2')?.setValue(0);
    this.pickForm.get('champion')?.setValue(0);

    // Reset error flags
    this.fivePointError = false;
    this.threePointError = false;
    this.tenPointError = false;
    this.threePointGames = 0;
    this.fivePointGames = 0;
    this.tenPointGames = 0;
    this.showSubmitError = false;
    this.gamesPicked = 0;

    // Validate to clear any error states
    this.validateChampionship();
    this.validateBonusPoints();
  }

  public toggleRulesSection() {
    this.showRulesSection = !this.showRulesSection;
  }

  public calculateTotalPoints(): number {
    let totalPoints = 0;
    this.pickFormArray.value.forEach((pick: any) => {
      if ((pick && pick.team1picked) || pick.team2picked) {
        totalPoints += pick.points;
      }
    });

    if (this.pickForm.value.playoff1) {
      totalPoints += 2;
    }
    if (this.pickForm.value.playoff2) {
      totalPoints += 2;
    }
    if (this.pickForm.value.champion) {
      totalPoints += 5;
    }
    return totalPoints;
  }

  public calculateMaxPossiblePoints(): number {
    const totalGames = this.picks.length;
    // Calculate points using highest values first
    // 1 game worth 10 points
    let maxPoints = this.maxTenPointGames * 10;
    // 5 games worth 5 points each
    maxPoints += this.maxFivePointGames * 5;
    // 5 games worth 3 points each
    maxPoints += this.maxThreePointGames * 3;
    // Remaining games worth 1 point each
    const remainingGames =
      totalGames -
      this.maxTenPointGames -
      this.maxFivePointGames -
      this.maxThreePointGames;
    maxPoints += Math.max(0, remainingGames);
    // Playoff selections: 2 points each for 2 teams
    maxPoints += 4;
    // Champion selection: 5 points
    maxPoints += 5;
    return maxPoints;
  }

  public selectTiebreaker1(gameId: string) {
    const pick = this.getPickFromId(gameId);
    this.tiebreaker1 = pick.team_1_name + ' vs. ' + pick.team_2_name;
    this.tiebreaker1Id = +gameId;
  }

  private getPickFromId(gameId: string): PickModel {
    return this.tiebreakerPicks.filter(function (pick) {
      return pick.game_id === gameId;
    })[0];
  }

  private sortByDate() {
    if (this.games) {
      this.games.sort((a: Game, b: Game) => {
        return +new Date(a.GameTime!) - +new Date(b.GameTime!);
      });
    }
  }

  private isBonusGame(game: Game, name: string): boolean {
    const bonusGameNames = [
      'Military',
      'Pinstripe',
      'Fenway',
      'Pop-Tarts',
      'Arizona',
      'New Mexico',
      'Gator',
      'Texas',
    ];

    return bonusGameNames.includes(name);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  public pickForMe(): void {
    // Collect non-playoff games to assign bonus points
    const nonPlayoffGameIndices: number[] = [];
    const playoffGameIndices: number[] = [];
    const bonusEligibleIndices: number[] = [];

    this.pickFormArray.controls.forEach((control, index) => {
      // Safely check if this pick exists and is a playoff game
      const isPlayoff =
        control.get('gameId')?.value &&
        this.picks &&
        index < this.picks.length &&
        this.picks[index] &&
        this.picks[index].is_playoff;

      if (isPlayoff) {
        playoffGameIndices.push(index);
      } else {
        nonPlayoffGameIndices.push(index);
        // Check if this game is bonus-eligible (can receive 10 points)
        if (index < this.picks.length && this.picks[index].is_new_years_game) {
          bonusEligibleIndices.push(index);
        }
      }
    });

    // Safely select bonus point games (account for fewer games than expected)
    const threePointIndices = this.getRandomIndices(
      nonPlayoffGameIndices,
      Math.min(this.maxThreePointGames, nonPlayoffGameIndices.length)
    );

    const remainingIndices = nonPlayoffGameIndices.filter(
      (i) => !threePointIndices.includes(i)
    );
    const fivePointIndices = this.getRandomIndices(
      remainingIndices,
      Math.min(this.maxFivePointGames, remainingIndices.length)
    );

    // Only select 10-point games from bonus-eligible games
    const tenPointCandidates = remainingIndices.filter(
      (i) => !fivePointIndices.includes(i) && bonusEligibleIndices.includes(i)
    );
    const tenPointIndices = this.getRandomIndices(
      tenPointCandidates,
      Math.min(this.maxTenPointGames, tenPointCandidates.length)
    );

    // Pick a random winner for each game and assign bonus points
    this.pickFormArray.controls.forEach((control, index) => {
      // Randomly pick team 1 or team 2 (50/50 chance)
      const pickTeam1 = Math.random() < 0.5;

      control.patchValue({
        team1picked: pickTeam1,
        team2picked: !pickTeam1,
      });

      // Assign bonus points
      let points = 1;
      if (threePointIndices.includes(index)) {
        points = 3;
      } else if (fivePointIndices.includes(index)) {
        points = 5;
      } else if (tenPointIndices.includes(index)) {
        points = 10;
      }
      control.patchValue({ points });
    });

    // Randomly pick playoff teams if available
    // Use separate arrays for playoff1 and playoff2 to match the dropdown options
    const playoffSchoolsA = this.playoffSchoolsA;
    const playoffSchoolsB = this.playoffSchoolsB;
    const playoffSchools = this.playoffSchools;

    if (
      playoffSchoolsA &&
      playoffSchoolsA.length >= 1 &&
      playoffSchoolsB &&
      playoffSchoolsB.length >= 1 &&
      playoffSchools &&
      playoffSchools.length >= 2
    ) {
      // Pick from left side (playoffSchoolsA)
      const randomPlayoff1Index = Math.floor(
        Math.random() * playoffSchoolsA.length
      );
      const playoff1TeamId = playoffSchoolsA[randomPlayoff1Index].school_id;

      // Pick from right side (playoffSchoolsB)
      const randomPlayoff2Index = Math.floor(
        Math.random() * playoffSchoolsB.length
      );
      const playoff2TeamId = playoffSchoolsB[randomPlayoff2Index].school_id;

      // Pick champion from all playoff schools
      const randomChampionIndex = Math.floor(
        Math.random() * playoffSchools.length
      );
      const championTeamId = playoffSchools[randomChampionIndex].school_id;

      // Ensure all values are set properly (not null or undefined)
      if (playoff1TeamId && playoff2TeamId && championTeamId) {
        this.pickForm.get('playoff1')?.setValue(playoff1TeamId);
        this.pickForm.get('playoff2')?.setValue(playoff2TeamId);
        this.pickForm.get('champion')?.setValue(championTeamId);
      }
    }

    // Validate championship selections to clear any error states
    this.validateChampionship();
    this.validateBonusPoints();
    this.countGamesPicked();
  }

  private getRandomIndices(indices: number[], count: number): number[] {
    if (indices.length === 0 || count === 0) return [];
    if (count >= indices.length) return indices;

    // Fisher-Yates shuffle for better randomness and performance
    const shuffled = [...indices];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}
