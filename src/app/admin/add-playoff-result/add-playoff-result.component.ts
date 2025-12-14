import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { PlayoffSchool } from 'src/app/shared/services/bowl.model';
import { BowlService } from 'src/app/shared/services/bowl.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { SkyAlertModule } from '@skyux/indicators';

@Component({
  standalone: true,
  selector: 'app-add-playoff-result',
  imports: [CommonModule, ReactiveFormsModule, SkyAlertModule],
  providers: [BowlService, SettingsService],
  templateUrl: './add-playoff-result.component.html',
  styleUrls: ['./add-playoff-result.component.scss'],
})
export class AddPlayoffResultComponent implements OnInit {
  public resultsForm: FormGroup<{
    school1: FormControl<number | null>;
    school2: FormControl<number | null>;
    champion: FormControl<number | null>;
  }>;
  public playoffSchools: PlayoffSchool[] = [];
  public playoffSchoolsA: PlayoffSchool[] = [];
  public playoffSchoolsB: PlayoffSchool[] = [];
  public successMsg = '';
  public showSuccess = false;
  public errorMsg = '';
  public showError = false;

  private currentYear: number = 0;

  constructor(
    private svc: BowlService,
    private formBuilder: FormBuilder,
    private settings: SettingsService
  ) {
    this.resultsForm = this.formBuilder.group({
      school1: new FormControl(0),
      school2: new FormControl(0),
      champion: new FormControl(0),
    });

    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  public ngOnInit(): void {
    this.loadPlayoffSchools();
  }

  private loadPlayoffSchools(): void {
    this.svc.getPlayoffSchools(this.currentYear).subscribe((result) => {
      const leftSeeds = [1, 4, 5, 12, 8, 9];
      const rightSeeds = [2, 3, 6, 7, 10, 11];
      this.playoffSchools = result.sort(
        (a: PlayoffSchool, b: PlayoffSchool) => {
          return a.seed_number! > b.seed_number! ? 1 : -1;
        }
      );

      this.playoffSchoolsA = this.playoffSchools.filter((x) => {
        return leftSeeds.indexOf(x.seed_number!) > -1;
      });
      this.playoffSchoolsB = this.playoffSchools.filter((x) => {
        return rightSeeds.indexOf(x.seed_number!) > -1;
      });
    });
  }

  public submitResults(): void {
    this.showSuccess = false;
    this.showError = false;

    const school1 = this.resultsForm.get('school1')?.value;
    const school2 = this.resultsForm.get('school2')?.value;
    const champion = this.resultsForm.get('champion')?.value;

    // Validate selections
    if (!school1 || !school2 || !champion) {
      this.errorMsg = 'Please select all three teams.';
      this.showError = true;
      return;
    }

    if (school1 === school2) {
      this.errorMsg = 'The two championship teams must be different.';
      this.showError = true;
      return;
    }

    const request = {
      year: this.currentYear,
      school1_id: school1,
      school2_id: school2,
      champion_school_id: champion,
    };

    this.svc.addPlayoffResult(request).subscribe(
      () => {
        this.successMsg = 'Playoff results saved successfully!';
        this.showSuccess = true;
        // Reload the playoff schools list to show any updates
        this.loadPlayoffSchools();
        // Reset form
        this.resultsForm.reset({
          school1: 0,
          school2: 0,
          champion: 0,
        });
      },
      (error) => {
        console.error('Error saving playoff results:', error);
        this.errorMsg = 'Failed to save playoff results. Please try again.';
        this.showError = true;
      }
    );
  }
}
