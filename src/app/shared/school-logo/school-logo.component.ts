import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-school-logo',
  imports: [CommonModule],
  template: `
    <div class="school-with-logo">
      <img
        *ngIf="logoId"
        [src]="getLogoPath()"
        [alt]="schoolName"
        class="school-logo"
        (error)="onImageError($event)"
      />
      <span class="school-name">{{ schoolName }}</span>
    </div>
  `,
  styles: [
    `
      .school-with-logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .school-logo {
        height: 24px;
        width: auto;
        max-width: 40px;
        object-fit: contain;
      }

      .school-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class SchoolLogoComponent {
  @Input() schoolName: string | undefined = '';
  @Input() logoId: string | undefined;

  getLogoPath(): string {
    if (!this.logoId) {
      return '';
    }
    return `assets/logos/${this.logoId}.png`;
  }

  onImageError(event: Event): void {
    // Hide the image if it fails to load
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
