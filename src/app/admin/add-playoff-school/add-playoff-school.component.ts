import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { SkyAppConfig } from '@skyux/config';
import { SkyInputBoxModule } from '@skyux/forms';
import { SkyRepeaterModule } from '@skyux/lists';
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
    
  ],
  providers: [BowlService, SettingsService],
  templateUrl: './add-playoff-school.component.html',
  styleUrls: ['./add-playoff-school.component.scss'],
})
export class AddPlayoffSchoolComponent implements OnInit {
  public schools: School[] = [];
  public playoffSchools: PlayoffSchool[] = [];

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
  }

  public ngOnInit(): void {
    this.svc.getSchools().subscribe((result) => {
      this.schools = result;
    });

    this.svc.getPlayoffSchools(this.settingsSvc.currentYear).subscribe((result) => {
      this.playoffSchools = result;
    });
  }

  public submit() {
    if (this.schoolForm.value.school && this.schoolForm.value.seed) {
      const request: PlayoffSchoolRequest = {
        year: this.settingsSvc.currentYear,
        school_id: this.schoolForm.value.school.ID!,
        school_name: this.schoolForm.value.school.Name!,
        seed_number: this.schoolForm.value.seed,
      };

      this.svc.addPlayoffSchool(request).subscribe();
    }
  }
}
