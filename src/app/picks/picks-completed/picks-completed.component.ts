import { Component, Input } from '@angular/core';
import { PickModel } from '../../shared/services/bowl.model';
import { SkyIconModule } from '@skyux/indicators';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-picks-completed',
  imports: [CommonModule, SkyIconModule],
  templateUrl: './picks-completed.component.html',
  styleUrls: ['./picks-completed.component.scss'],
})
export class PicksCompletedComponent {
  @Input()
  public picks: PickModel[] = [];

  @Input()
  public name = '';

  @Input()
  public email = '';

  @Input()
  public championshipParticipant1 = '';

  @Input()
  public championshipParticipant2 = '';

  @Input()
  public champion = '';
}
