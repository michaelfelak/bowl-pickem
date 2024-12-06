import { Component } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { Bowl } from '../../shared/services/bowl.model';
import { SkyRepeaterModule } from '@skyux/lists';
import { CommonModule } from '@angular/common';
import { SkyInputBoxModule } from '@skyux/forms';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { SkyAlertModule } from '@skyux/indicators';

@Component({
  standalone: true,
  selector: 'app-add-bowl',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkyAlertModule,
    SkyInputBoxModule,
    SkyRepeaterModule,
  ],
  templateUrl: './add-bowl.component.html',
  styleUrls: ['./add-bowl.component.scss'],
})
export class AddBowlComponent {
  public errorMsg!: string;
  public hasError = false;
  public added = false;
  public addedMsg!: string;

  public addBowlForm: FormGroup<{
    bowlName: FormControl<string | null>;
    city: FormControl<string | null>;
    state: FormControl<string | null>;
    stadium: FormControl<string | null>;
  }>;

  constructor(private svc: BowlService, private fb: FormBuilder) {
    this.addBowlForm = this.fb.group({
      bowlName: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      stadium: new FormControl(''),
    });
  }

  public addBowl() {
    if (
      this.addBowlForm.value.bowlName === undefined ||
      this.addBowlForm.value.city === undefined ||
      this.addBowlForm.value.stadium === undefined ||
      this.addBowlForm.value.state === undefined
    ) {
      this.errorMsg = 'You must supply a value for all fields.';
      this.hasError = true;
      this.added = false;
    } else {
      this.hasError = false;
      this.errorMsg = '';
      const b: Bowl = {
        name: this.addBowlForm.value.bowlName!,
        city: this.addBowlForm.value.city!,
        state: this.addBowlForm.value.state!,
        stadium_name: this.addBowlForm.value.stadium!,
      };

      this.svc.addBowl(b).subscribe();

      // reset form
      this.added = true;
      this.addedMsg =
        this.addBowlForm.value.bowlName + ' Bowl successfully added.';
      this.addBowlForm.reset();
    }
  }
}
