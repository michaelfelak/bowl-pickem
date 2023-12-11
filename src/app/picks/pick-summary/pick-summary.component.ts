import { Component, Input } from '@angular/core';

@Component({
  selector: 'pick-summary',
  templateUrl: './pick-summary.component.html',
  styleUrls: ['./pick-summary.component.scss']
})
export class PickSummaryComponent {
  @Input() public name!: string;
  @Input() public email!: string;
  @Input() public threePointGames!: number;
  @Input() public fivePointGames!: number;
  @Input() public tenPointGames!: number;
  @Input() public possiblePoints!: number;
  @Input() public threePointError!: boolean;
  @Input() public fivePointError!: boolean;
  @Input() public tenPointError!: boolean;
}
