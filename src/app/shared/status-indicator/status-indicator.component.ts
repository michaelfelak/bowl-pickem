import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyIconModule } from '@skyux/indicators';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule, SkyIconModule],
  templateUrl: './status-indicator.component.html',
})
export class StatusIndicatorComponent {
  @Input()
  public value?: boolean;

  @Input()
  public showCheck?: boolean;
}
