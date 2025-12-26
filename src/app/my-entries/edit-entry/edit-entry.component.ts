import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BowlService } from '../../shared/services/bowl.service';
import { AuthService } from '../../shared/services/auth.service';
import { Entry, PickModel, Game } from '../../shared/services/bowl.model';
import {
  PicksValidationService,
  ValidationResult,
} from '../../shared/services/picks-validation.service';
import { SkyWaitService, SkyAlertModule } from '@skyux/indicators';
import * as dayjs from 'dayjs';
import { SettingsService } from '../../shared/services/settings.service';
import {
  EditConfirmationComponent,
  EditChange,
} from './edit-confirmation/edit-confirmation.component';
import { SkyToastModule, SkyToastService, SkyToastType } from '@skyux/toast';

interface EditablePick extends PickModel {
  gameLabel?: string;
  gameTime?: string;
  isPicked?: boolean;
  isEditable?: boolean;
  hasStarted?: boolean;
  isFinished?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-edit-entry',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SkyAlertModule,
    EditConfirmationComponent,
    SkyToastModule,
  ],
  providers: [SettingsService, PicksValidationService, SkyToastService],
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.scss'],
})
export class EditEntryComponent implements OnInit {
  public entry: Entry | null = null;
  public picks: EditablePick[] = [];
  public games: Game[] = [];
  public isLoading = true;
  public isSaving = false;
  public showError = false;
  public showSuccess = false;
  public errorMsg: string = '';
  public successMsg: string = '';
  public entryId: string = '';
  public currentYear: number = 0;
  public showConfirmationModal = false;
  public confirmationChanges: EditChange[] = [];

  // Validation state
  public validationResult: ValidationResult | null = null;
  public pointValues: number[] = [1, 3, 5];
  public newYearsPointValues: number[] = [1, 3, 5, 10];
  public availablePointValues: Record<number, boolean> = {};

  // Game count header properties
  public gamesPicked: number = 0;
  public totalGames: number = 0;
  public threePointGames: number = 0;
  public fivePointGames: number = 0;
  public tenPointGames: number = 0;
  public maxThreePointGames: number = 5;
  public maxFivePointGames: number = 5;
  public maxTenPointGames: number = 1;
  public totalPossiblePoints: number = 0;

  // Form
  pickForm = this.formBuilder.group({
    picks: new FormArray([]),
  });

  get pickFormArray(): FormArray {
    return this.pickForm.get('picks') as FormArray;
  }

  get pickFormControls(): any[] {
    return this.pickFormArray.controls;
  }

  constructor(
    private titleService: Title,
    private bowlService: BowlService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private waitService: SkyWaitService,
    private settings: SettingsService,
    private validationService: PicksValidationService,
    private formBuilder: FormBuilder,
    private skyToastService: SkyToastService
  ) {
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.entryId) {
      this.handleError('Entry ID not found');
      return;
    }

    this.titleService.setTitle("Edit Entry - Bowl Pick'em");

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  private setupFormValueChanges(): void {
    this.pickForm.valueChanges.subscribe(() => {
      if (!this.isLoading) {
        this.validatePicks();
      }
    });

    // Also watch for points changes on individual controls (including disabled ones)
    this.pickFormArray.controls.forEach((control) => {
      const pointsControl = control.get('points');
      if (pointsControl) {
        // Monitor statusChanges to catch disabled control updates
        pointsControl.statusChanges.subscribe(() => {
          if (!this.isLoading) {
            this.validatePicks();
          }
        });

        pointsControl.valueChanges.subscribe(() => {
          if (!this.isLoading) {
            this.validatePicks();
          }
        });
      }
    });
  }

  private loadData(): void {
    this.waitService.beginNonBlockingPageWait();

    // Load games and entry data in parallel
    Promise.all([
      this.bowlService.getGames(this.currentYear).toPromise(),
      this.bowlService.getEntryWithPicks(this.entryId).toPromise(),
    ])
      .then(([games, entryData]) => {
        this.games = games || [];
        this.entry = entryData;
        this.processPicks(entryData?.picks || []);
        this.buildPickForm();
        this.setupFormValueChanges();

        // TODO reenable for production
        // Check if all games have started
        // const allStarted = this.picks.every((p) => p.hasStarted);
        // if (allStarted) {
        //   this.handleError(
        //     'All games for this entry have already started and cannot be edited.'
        //   );
        // }

        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
        this.validatePicks();
      })
      .catch((error) => {
        this.handleError('Failed to load entry details');
        console.error('Error loading entry:', error);
        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
      });
  }

  /**
   * Process picks to add game information and formatting
   */
  private processPicks(picks: PickModel[]): void {
    this.picks = picks.map((pick) => {
      const game = this.games.find((g) => g.ID === pick.game_id);
      // Try to get game time from games array first, then fall back to pick's game_time
      const gameTimeStr = game?.GameTime || pick.game_time;
      const gameTime = gameTimeStr ? dayjs(gameTimeStr) : null;
      // Add 4 hours to current time to account for timezone offset
      const now = dayjs().add(1, 'hours');
      const hasStarted = gameTime ? now.isAfter(gameTime) : false;

      // Allow editing only if game time is in the future
      const isEditable = !hasStarted;
      
      // Game is finished if both scores are entered (non-zero or non-undefined)
      const isFinished = hasStarted && (pick.score_1 !== undefined && pick.score_1 !== null && pick.score_2 !== undefined && pick.score_2 !== null);

      return {
        ...pick,
        gameLabel: this.getGameLabel(pick),
        gameTime: gameTime?.format('MMM DD, YYYY h:mm A') || 'TBD',
        isPicked: !!(pick.team_1_picked || pick.team_2_picked),
        isEditable: isEditable,
        hasStarted: hasStarted,
        isFinished: isFinished,
      };
    });
  }

  /**
   * Build reactive form with existing picks
   */
  private buildPickForm(): void {
    this.picks.forEach((pick, index) => {
      this.pickFormArray.push(
        this.formBuilder.group({
          game_id: new FormControl(pick.game_id),
          team_1_picked: new FormControl({
            value: pick.team_1_picked || false,
            disabled: !pick.isEditable,
          }),
          team_2_picked: new FormControl({
            value: pick.team_2_picked || false,
            disabled: !pick.isEditable,
          }),
          team_1_name: new FormControl(pick.team_1_name),
          team_2_name: new FormControl(pick.team_2_name),
          points: new FormControl({
            value: pick.points || 1,
            disabled: !pick.isEditable,
          }),
          gameLabel: new FormControl(pick.gameLabel),
          gameTime: new FormControl(pick.gameTime),
          isEditable: new FormControl(pick.isEditable),
          hasStarted: new FormControl(pick.hasStarted),
          isFinished: new FormControl(pick.isFinished),
        })
      );
    });
  }

  /**
   * Get a readable game label (e.g., "Team1 vs Team2 - Bowl Name")
   */
  private getGameLabel(pick: PickModel): string {
    return `${pick.bowl_name} Bowl`;
  }

  /**
   * Get the picked team name
   */
  public getPickedTeam(pick: PickModel): string {
    if (pick.team_1_picked) {
      return pick.team_1_name || 'Team 1';
    } else if (pick.team_2_picked) {
      return pick.team_2_name || 'Team 2';
    }
    return 'Not Picked';
  }

  /**
   * Toggle a team selection for a pick
   */
  public togglePick(formIndex: number, teamNumber: 1 | 2): void {
    const pickControl = this.pickFormArray.at(formIndex);
    if (!pickControl.get('isEditable')?.value) return;

    if (teamNumber === 1) {
      const team1Value = pickControl.get('team_1_picked')?.value;
      pickControl.patchValue({
        team_1_picked: !team1Value,
        team_2_picked: false,
      });
    } else {
      const team2Value = pickControl.get('team_2_picked')?.value;
      pickControl.patchValue({
        team_2_picked: !team2Value,
        team_1_picked: false,
      });
    }
  }

  /**
   * Check if team is selected
   */
  public isTeamSelected(formIndex: number, teamNumber: 1 | 2): boolean {
    const pickControl = this.pickFormArray.at(formIndex);
    return teamNumber === 1
      ? pickControl.get('team_1_picked')?.value
      : pickControl.get('team_2_picked')?.value;
  }

  /**
   * Validate picks and update validation state
   */
  private validatePicks(): void {
    const picksFromForm = this.pickFormArray.getRawValue() as PickModel[];

    // Create a combined picks array that includes locked game data from original picks
    const picksToValidate = picksFromForm.map((pick, index) => {
      const original = this.picks[index];
      // For locked games, use the original pick's points
      // For editable games, use the form's current values
      let points = original.isEditable
        ? pick.points || 1
        : original.points || 1;
      return {
        ...pick,
        points: Number(points) || 1,
      };
    });

    this.validationResult =
      this.validationService.validateBonusPoints(picksToValidate);
    this.availablePointValues = this.validationService.getAvailablePointValues(
      picksToValidate,
      this.pointValues
    );

    // Update game count header statistics
    this.totalGames = this.picks.length;
    this.gamesPicked = picksToValidate.filter(
      (p) => p.team_1_picked || p.team_2_picked
    ).length;
    this.threePointGames = picksToValidate.filter((p) => p.points === 3).length;
    this.fivePointGames = picksToValidate.filter((p) => p.points === 5).length;
    this.tenPointGames = picksToValidate.filter((p) => p.points === 10).length;

    // Calculate and cache total possible points
    this.totalPossiblePoints = picksToValidate.reduce(
      (sum, pick) => sum + pick.points,
      0
    );
  }

  /**
   * Calculate the total points value for all picks in the form
   */
  public calculateTotalPoints(): number {
    if (!this.pickFormArray) return 0;

    let total = 0;
    this.pickFormArray.controls.forEach((control, index) => {
      const original = this.picks[index];
      // For editable games, use the form's current value
      // For locked games, use the original value
      let points = original.isEditable
        ? control.get('points')?.value || 1
        : original.points || 1;
      // Ensure points is a number (form values come as strings)
      total += Number(points) || 1;
    });

    return total;
  }

  /**
   * Calculate the maximum possible points for all games
   */
  public calculateMaxPossiblePoints(): number {
    if (!this.pickFormArray) return 0;

    let total = 0;
    this.pickFormArray.controls.forEach((control) => {
      const points = control.get('points')?.value || 1;
      total += points;
    });

    return total;
  }

  /**
   * Get available points for a specific pick
   */
  public getAvailablePoints(formIndex: number): number[] {
    const pickControl = this.pickFormArray.at(formIndex);
    const pick = this.picks[formIndex];

    // Check if this is a bonus game by checking the bowl name
    const bowlName = pick?.bowl_name || '';
    const isNewYearsGame = this.settings.isBonusGame(bowlName);

    const basePoints = isNewYearsGame
      ? this.newYearsPointValues
      : this.pointValues;

    return basePoints; // Return all available points without filtering
  }

  /**
   * Save changes to the entry
   */
  public saveChanges(): void {
    if (!this.entry || !this.validationResult?.isValid) {
      this.handleError('Please fix validation errors before saving.');
      return;
    }

    // Get all picks from form
    const picksFromForm = this.pickFormArray.value as PickModel[];

    // Track changes between original and current state
    const changes: EditChange[] = [];
    picksFromForm.forEach((pick, index) => {
      const original = this.picks[index];
      // Only track changes for editable picks
      if (!original.isEditable) return;

      let hasChanged = false;
      const change: EditChange = {
        game:
          original.bowl_name ||
          original.gameLabel ||
          `${original.team_1_name} vs ${original.team_2_name}`,
        team1Name: original.team_1_name,
        team2Name: original.team_2_name,
        gameTime: original.gameTime,
      };

      // Check for team changes
      if (
        original.team_1_picked !== pick.team_1_picked ||
        original.team_2_picked !== pick.team_2_picked
      ) {
        const originalTeam = original.team_1_picked
          ? original.team_1_name
          : original.team_2_picked
          ? original.team_2_name
          : 'No pick';
        const newTeam = pick.team_1_picked
          ? pick.team_1_name
          : pick.team_2_picked
          ? pick.team_2_name
          : 'No pick';
        if (originalTeam !== newTeam) {
          change.teamChange = newTeam;
          hasChanged = true;
        }
      }

      // Check for point changes
      if ((original.points || 1) !== (pick.points || 1)) {
        change.pointChange = {
          from: original.points || 1,
          to: pick.points || 1,
        };
        hasChanged = true;
      }

      if (hasChanged) {
        changes.push(change);
      }
    });

    // Store changes and show confirmation modal
    this.confirmationChanges = changes;
    this.showConfirmationModal = true;
  }

  /**
   * Handle confirmation modal confirm action
   */
  public confirmChanges(): void {
    this.showConfirmationModal = false;
    this.performSave();
  }

  /**
   * Handle confirmation modal cancel action
   */
  public cancelChanges(): void {
    this.showConfirmationModal = false;
  }

  /**
   * Perform the actual save operation
   */
  private performSave(): void {
    const picksFromForm = this.pickFormArray.value as PickModel[];

    this.isSaving = true;
    this.showError = false;
    this.showSuccess = false;

    // Filter to only editable picks for the payload
    const editablePicks = picksFromForm.filter(
      (pick, index) => this.picks[index].isEditable
    );

    // Prepare entry data with only editable picks
    const entryData = {
      entry_id: Number(this.entryId),
      picks: editablePicks,
    };

    this.bowlService.saveEntry(entryData).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.successMsg = 'Your picks have been updated successfully!';
        this.showSuccess = true;

        this.skyToastService.openMessage(
          'Your picks have been updated successfully!',
          {
            type: SkyToastType.Success,
            autoClose: true,
          }
        );
      },
      error: (error) => {
        console.error('Error updating picks:', error);
        this.isSaving = false;
        this.handleError('Failed to save your picks. Please try again.');
      },
    });
  }

  /**
   * Go back to entries list
   */
  public goBack(): void {
    this.router.navigate(['/my-entries']);
  }

  private handleError(message: string): void {
    this.errorMsg = message;
    this.showError = true;
  }

  public formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM DD, YYYY');
  }
}
