import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickModel } from '../../shared/services/bowl.model';

export interface SubmissionConfirmationData {
  entryName: string;
  totalPossiblePoints: number;
  threePointGames: PickModel[];
  fivePointGames: PickModel[];
  tenPointGames: PickModel[];
  allGamesPicked: boolean;
  totalGamesPicked: number;
  totalGames: number;
  championshipParticipant1?: string;
  championshipParticipant2?: string;
  champion?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

@Component({
  standalone: true,
  selector: 'app-submission-confirmation',
  imports: [CommonModule],
  templateUrl: './submission-confirmation.component.html',
  styleUrls: ['./submission-confirmation.component.scss'],
})
export class SubmissionConfirmationComponent {
  @Input() entryName: string = '';
  @Input() totalPossiblePoints: number = 0;
  @Input() threePointGames: PickModel[] = [];
  @Input() fivePointGames: PickModel[] = [];
  @Input() tenPointGames: PickModel[] = [];
  @Input() allGamesPicked: boolean = false;
  @Input() totalGamesPicked: number = 0;
  @Input() totalGames: number = 0;
  @Input() championshipParticipant1: string = '';
  @Input() championshipParticipant2: string = '';
  @Input() champion: string = '';
  @Input() onConfirm: () => void = () => {};
  @Input() onCancel: () => void = () => {};

  calculatePickedPoints(): number {
    const basePoints = this.totalGamesPicked; // 1 point per picked game
    const threePointBonus = this.threePointGames.length * 2; // 2 extra per 3-point game
    const fivePointBonus = this.fivePointGames.length * 4; // 4 extra per 5-point game
    const tenPointBonus = this.tenPointGames.length * 9; // 9 extra per 10-point game
    
    // Championship game points: 2 per participant, 5 for champion
    let championshipPoints = 0;
    if (this.championshipParticipant1) championshipPoints += 2;
    if (this.championshipParticipant2) championshipPoints += 2;
    if (this.champion) championshipPoints += 5;
    
    return basePoints + threePointBonus + fivePointBonus + tenPointBonus + championshipPoints;
  }
}

