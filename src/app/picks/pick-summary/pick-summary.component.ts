import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkyAlertModule, SkyKeyInfoModule } from '@skyux/indicators';

@Component({
  standalone: true,
  selector: 'app-pick-summary',
  imports: [CommonModule, SkyAlertModule, SkyKeyInfoModule],
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
  @Input() public gamesPicked: number = 0;
  @Input() public totalGames: number = 0;

  get progressPercentage(): number {
    return this.totalGames > 0 ? Math.round((this.gamesPicked / this.totalGames) * 100) : 0;
  }
}
