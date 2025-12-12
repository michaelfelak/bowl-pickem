import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EditChange {
  game: string;
  team1Name?: string;
  team2Name?: string;
  gameTime?: string;
  teamChange?: string;
  pointChange?: {
    from: number;
    to: number;
  };
}

@Component({
  standalone: true,
  selector: 'app-edit-confirmation',
  imports: [CommonModule],
  templateUrl: './edit-confirmation.component.html',
  styleUrls: ['./edit-confirmation.component.scss'],
})
export class EditConfirmationComponent {
  @Input() changes: EditChange[] = [];
  @Input() onConfirm: () => void = () => {};
  @Input() onCancel: () => void = () => {};

  hasChanges(): boolean {
    return this.changes && this.changes.length > 0;
  }
}
