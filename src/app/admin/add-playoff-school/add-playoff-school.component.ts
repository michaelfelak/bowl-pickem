import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { SkyAlertModule } from '@skyux/indicators';
import { SkyInputBoxModule } from '@skyux/forms';
import {
  PlayoffSchool,
  PlayoffSchoolRequest,
  School,
} from 'src/app/shared/services/bowl.model';
import { BowlService } from 'src/app/shared/services/bowl.service';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-add-playoff-school',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkyInputBoxModule,
    SkyAlertModule,
  ],
  providers: [BowlService, SettingsService],
  templateUrl: './add-playoff-school.component.html',
  styleUrls: ['./add-playoff-school.component.scss'],
})
export class AddPlayoffSchoolComponent implements OnInit {
  public schools: School[] = [];
  public playoffSchools: PlayoffSchool[] = [];
  public successMsg = '';
  public showSuccess = false;
  public errorMsg = '';
  public showError = false;

  private currentYear: number = 0;

  public schoolForm: FormGroup<{
    school: FormControl<School | null>;
    seed: FormControl<number | null>;
  }>;

  constructor(
    private svc: BowlService,
    private formBuilder: FormBuilder,
    private settingsSvc: SettingsService
  ) {
    this.schoolForm = this.formBuilder.group({
      school: new FormControl({}),
      seed: new FormControl(1),
    });
    
    this.settingsSvc.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  public ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.svc.getSchools().subscribe((result) => {
      this.schools = result;
    });

    this.loadPlayoffSchools();
  }

  private loadPlayoffSchools(): void {
    this.svc
      .getPlayoffSchools(this.currentYear)
      .subscribe((result) => {
        this.playoffSchools = result;
      });
  }

  public submit(): void {
    this.showSuccess = false;
    this.showError = false;

    if (!this.schoolForm.value.school || !this.schoolForm.value.seed) {
      this.errorMsg = 'Please select a school and seed number.';
      this.showError = true;
      return;
    }

    const request: PlayoffSchoolRequest = {
      year: this.currentYear,
      school_id: this.schoolForm.value.school.id!,
      school_name: this.schoolForm.value.school.name!,
      seed_number: this.schoolForm.value.seed,
    };

    this.svc.addPlayoffSchool(request).subscribe(
      () => {
        this.successMsg = `${request.school_name} (#${request.seed_number}) added successfully!`;
        this.showSuccess = true;
        // Reload the playoff schools list
        this.loadPlayoffSchools();
        // Reset form
        this.schoolForm.reset({
          school: null,
          seed: 1,
        });
      },
      (error) => {
        console.error('Error adding playoff school:', error);
        this.errorMsg = 'Failed to add school. Please try again.';
        this.showError = true;
      }
    );
  }
}
