import { Component, Input } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { Bowl } from '../../shared/services/bowl.model';

@Component({
  selector: 'add-bowl',
  templateUrl: './add-bowl.component.html',
  styleUrls: ['./add-bowl.component.scss']
})
export class AddBowlComponent {
  @Input() public bowlName!: string;
  @Input() public city!: string;
  @Input() public state!: string;
  @Input() public stadium!: string;
  public errorMsg!: string;
  public hasError: boolean = false;
  public added: boolean = false;
  public addedMsg!: string;

  constructor(private svc: BowlService) {}

  public addBowl() {
    if (
      this.bowlName === undefined ||
      this.city === undefined ||
      this.state === undefined ||
      this.stadium === undefined
    ) {
      this.errorMsg = 'You must supply a value for all fields.';
      this.hasError = true;
      this.added = false;
    } else {
      this.hasError = false;
      this.errorMsg = '';
      let b: Bowl = {
        id: undefined,
        name: this.bowlName,
        city: this.city,
        state: this.state,
        stadium_name: this.stadium
      };

      this.svc.addBowl(b).subscribe();

      // reset form
      this.bowlName = this.city = this.stadium = this.state = '';
      this.added = true;
      this.addedMsg = this.bowlName + 'Bowl successfully added.';
    }
  }
}
