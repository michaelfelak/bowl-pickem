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
  onConfirm: () => void;
  onCancel: () => void;
}

@Component({
  standalone: true,
  selector: 'app-submission-confirmation',
  imports: [CommonModule],
  template: `
    <div class="confirmation-modal-overlay" (click)="onCancel()">
      <div class="confirmation-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirm Your Entry Submission</h2>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>
        
        <div class="modal-content">
          <!-- Entry Name -->
          <div class="section">
            <h3>Entry Name</h3>
            <p class="entry-name">{{ entryName }}</p>
          </div>

          <!-- Games Picked Summary -->
          <div class="section">
            <h3>Games Picked</h3>
            <p class="game-summary">{{ totalGamesPicked }} of {{ totalGames }} games selected ({{ calculatePickedPoints() }} possible points)</p>
            <div *ngIf="!allGamesPicked" class="warning">
              ⚠️ You have not picked all games
            </div>
          </div>

          <!-- Bonus Point Winners -->
          <div class="section">
            <h3>Bonus Point Winners</h3>
            <div class="bonus-games">
              <!-- 10 Point Winner (singular) -->
              <div class="bonus-category" *ngIf="tenPointGames.length > 0">
                <h4>10-Point Winner</h4>
                <ul>
                  <li *ngFor="let game of tenPointGames">
                    {{ game.bowl_name }} Bowl: <strong>{{ game.team_1_picked ? game.team_1_name : game.team_2_name }}</strong>
                  </li>
                </ul>
              </div>

              <!-- 5 Point Winners -->
              <div class="bonus-category" *ngIf="fivePointGames.length > 0">
                <h4>5-Point Winners ({{ fivePointGames.length }})</h4>
                <ul>
                  <li *ngFor="let game of fivePointGames">
                    {{ game.bowl_name }} Bowl: <strong>{{ game.team_1_picked ? game.team_1_name : game.team_2_name }}</strong>
                  </li>
                </ul>
              </div>

              <!-- 3 Point Winners -->
              <div class="bonus-category" *ngIf="threePointGames.length > 0">
                <h4>3-Point Winners ({{ threePointGames.length }})</h4>
                <ul>
                  <li *ngFor="let game of threePointGames">
                    {{ game.bowl_name }} Bowl: <strong>{{ game.team_1_picked ? game.team_1_name : game.team_2_name }}</strong>
                  </li>
                </ul>
              </div>

              <!-- No bonus games message -->
              <p *ngIf="tenPointGames.length === 0 && fivePointGames.length === 0 && threePointGames.length === 0" class="no-bonus">
                No bonus point games selected
              </p>
            </div>
          </div>

          <!-- Total Points -->
          <div class="section total-points">
            <h3>Total Possible Points</h3>
            <p class="points-value">{{ totalPossiblePoints }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" (click)="onCancel()">Cancel</button>
          <button class="btn btn-confirm" (click)="onConfirm()">Confirm & Submit</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .confirmation-modal {
      background: white;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      min-width: 350px;
      max-width: 550px;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-content {
      padding: 16px 20px;
    }

    .section {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
    }

    .section h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .entry-name {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #014d0e;
    }

    .game-summary {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .warning {
      color: #d9534f;
      font-size: 12px;
      margin-top: 4px;
    }

    .bonus-games {
      padding: 4px 0;
    }

    .bonus-category {
      margin-bottom: 10px;
    }

    .bonus-category:last-child {
      margin-bottom: 0;
    }

    .bonus-category h4 {
      margin: 0 0 4px 0;
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }

    .bonus-category ul {
      margin: 0;
      padding-left: 16px;
      list-style: none;
    }

    .bonus-category li {
      margin: 2px 0;
      font-size: 12px;
      color: #666;
      padding-left: 12px;
      position: relative;
      line-height: 1.3;
    }

    .bonus-category li:before {
      content: "•";
      position: absolute;
      left: 0;
    }

    .no-bonus {
      margin: 0;
      font-size: 12px;
      color: #999;
      font-style: italic;
    }

    .total-points {
      background-color: #f5f5f5;
      padding: 12px 15px;
      border-radius: 4px;
      border: none;
      margin-bottom: 0;
    }

    .total-points h3 {
      margin-bottom: 6px;
    }

    .points-value {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #014d0e;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 20px;
      border-top: 1px solid #e0e0e0;
      background-color: #fafafa;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background-color: #e8e8e8;
      color: #333;
    }

    .btn-cancel:hover {
      background-color: #d0d0d0;
    }

    .btn-confirm {
      background-color: #014d0e;
      color: white;
    }

    .btn-confirm:hover {
      background-color: #0a3508;
    }

    .btn-confirm:active {
      transform: scale(0.98);
    }
  `]
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
  @Input() onConfirm: () => void = () => {};
  @Input() onCancel: () => void = () => {};

  calculatePickedPoints(): number {
    const basePoints = this.totalGamesPicked; // 1 point per picked game
    const threePointBonus = this.threePointGames.length * 2; // 2 extra per 3-point game
    const fivePointBonus = this.fivePointGames.length * 4; // 4 extra per 5-point game
    const tenPointBonus = this.tenPointGames.length * 9; // 9 extra per 10-point game
    return basePoints + threePointBonus + fivePointBonus + tenPointBonus;
  }
}

