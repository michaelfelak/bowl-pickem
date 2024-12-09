import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlayoffSchool } from 'src/app/shared/services/bowl.model';
import { BowlService } from 'src/app/shared/services/bowl.service';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-add-playoff-result',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [BowlService, SettingsService],
  templateUrl: './add-playoff-result.component.html',
  styleUrls: ['./add-playoff-result.component.scss'],
})
export class AddPlayoffResultComponent {
  public resultsForm: FormGroup<{
    school1: FormControl<number | null>;
    school2: FormControl<number | null>;
    champion: FormControl<number | null>;
  }>;
  public playoffSchools: PlayoffSchool[] = [];
  public playoffSchoolsA: PlayoffSchool[] = [];
  public playoffSchoolsB: PlayoffSchool[] = [];

  constructor(
    private svc: BowlService,
    private formBuilder: FormBuilder,
    private settingsSvc: SettingsService
  ) {
    this.resultsForm = this.formBuilder.group({
      school1: new FormControl(0),
      school2: new FormControl(0),
      champion: new FormControl(0),
    });
  }


  public ngOnInit(): void {
    this.svc.getPlayoffSchools(this.settingsSvc.currentYear).subscribe((result) => {
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

    this.svc
      .getPlayoffSchools(this.settingsSvc.currentYear)
      .subscribe((result) => {
        this.playoffSchools = result;
      });
  }
}
