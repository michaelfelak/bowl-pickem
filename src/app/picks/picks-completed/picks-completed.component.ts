import { Component, Input } from '@angular/core';
import { PickModel } from '../../shared/services/bowl.model';

@Component({
  selector: 'picks-completed',
  templateUrl: './picks-completed.component.html',
  styleUrls: ['./picks-completed.component.scss']
})
export class PicksCompletedComponent {
  @Input() public picks: PickModel[] = [];
  @Input() public name: string = '';
  @Input() public email: string = '';
}
