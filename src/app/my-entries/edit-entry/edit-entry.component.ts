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

interface EditablePick extends PickModel {
  gameLabel?: string;
  gameTime?: string;
  isPicked?: boolean;
  isEditable?: boolean;
  hasStarted?: boolean;
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
  ],
  providers: [SettingsService, PicksValidationService],
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
  public currentYear: number;

  // Validation state
  public validationResult: ValidationResult | null = null;
  public pointValues: number[] = [1, 3, 5];
  public newYearsPointValues: number[] = [1, 3, 5, 10];
  public availablePointValues: Record<number, boolean> = {};

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
    private formBuilder: FormBuilder
  ) {
    this.currentYear = this.settings.currentYear;
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
      const gameTime = game?.GameTime ? dayjs(game.GameTime) : null;
      const now = dayjs();
      const hasStarted = gameTime ? now.isAfter(gameTime) : false;

      // TODO: Remove this for production - currently making all entries editable for testing
      const isEditable = true; // !hasStarted;

      return {
        ...pick,
        gameLabel: this.getGameLabel(pick),
        gameTime: gameTime?.format('MMM DD, YYYY h:mm A') || 'TBD',
        isPicked: !!(pick.team_1_picked || pick.team_2_picked),
        isEditable: isEditable,
        hasStarted: false, // hasStarted
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
          team_1: new FormControl(pick.team_1_picked || false),
          team_2: new FormControl(pick.team_2_picked || false),
          team_1_name: new FormControl(pick.team_1_name),
          team_2_name: new FormControl(pick.team_2_name),
          points: new FormControl(pick.points || 1),
          gameLabel: new FormControl(pick.gameLabel),
          gameTime: new FormControl(pick.gameTime),
          isEditable: new FormControl(pick.isEditable),
          //   hasStarted: new FormControl(pick.hasStarted),
          hasStarted: new FormControl(false),
        })
      );
    });
  }

  /**
   * Get a readable game label (e.g., "Team1 vs Team2 - Bowl Name")
   */
  private getGameLabel(pick: PickModel): string {
    const vs = ' vs ';
    const team1 = pick.team_1_name || 'Team 1';
    const team2 = pick.team_2_name || 'Team 2';
    const bowl = pick.bowl_name ? ` - ${pick.bowl_name}` : '';

    return `${team1}${vs}${team2}${bowl}`;
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
      const team1Value = pickControl.get('team_1')?.value;
      pickControl.patchValue({
        team_1: !team1Value,
        team_2: false,
      });
    } else {
      const team2Value = pickControl.get('team_2')?.value;
      pickControl.patchValue({
        team_2: !team2Value,
        team_1: false,
      });
    }
  }

  /**
   * Check if team is selected
   */
  public isTeamSelected(formIndex: number, teamNumber: 1 | 2): boolean {
    const pickControl = this.pickFormArray.at(formIndex);
    return teamNumber === 1
      ? pickControl.get('team_1')?.value
      : pickControl.get('team_2')?.value;
  }

  /**
   * Validate picks and update validation state
   */
  private validatePicks(): void {
    const picksFromForm = this.pickFormArray.value as PickModel[];
    this.validationResult =
      this.validationService.validateBonusPoints(picksFromForm);
    this.availablePointValues = this.validationService.getAvailablePointValues(
      picksFromForm,
      this.pointValues
    );
  }

  /**
   * Get available points for a specific pick
   */
  public getAvailablePoints(formIndex: number): number[] {
    const pickControl = this.pickFormArray.at(formIndex);
    const currentPoints = pickControl.get('points')?.value || 1;
    const isNewYearsGame = false; // TODO: determine from pick data if needed

    const basePoints = isNewYearsGame
      ? this.newYearsPointValues
      : this.pointValues;

    return basePoints.filter((points) => {
      if (points === currentPoints) return true; // Always allow current selection
      return this.availablePointValues[points] || false;
    });
  }

  /**
   * Save changes to the entry
   */
  public saveChanges(): void {
    if (!this.entry || !this.validationResult?.isValid) {
      this.handleError('Please fix validation errors before saving.');
      return;
    }

    if (confirm('Are you sure you want to save these changes?')) {
      this.isSaving = true;
      this.showError = false;
      this.showSuccess = false;

      // Map form values back to PickModel format
      const picksToUpdate = this.pickFormArray.value as PickModel[];
      console.log(picksToUpdate);
      // Prepare entry data with picks and entry ID (as required by /entry/save endpoint)
      const entryData = {
        entry_id: Number(this.entryId),
        picks: picksToUpdate,
      };

      this.bowlService.saveEntry(entryData).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.successMsg = 'Your picks have been updated successfully!';
          this.showSuccess = true;

          // Wait 2 seconds then navigate back
          setTimeout(() => {
            this.router.navigate(['/my-entries']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error updating picks:', error);
          this.isSaving = false;
          this.handleError('Failed to save your picks. Please try again.');
        },
      });
    }
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
