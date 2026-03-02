import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="platform-switcher-container">
      <button
        class="platform-menu-btn"
        [class.open]="showMenu"
        (click)="toggleMenu()"
        aria-label="Switch application"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="platform-menu" [class.open]="showMenu" *ngIf="showMenu">
        <a
          href="/bowl-pickem"
          class="platform-item active"
          (click)="closeMenu()"
        >
          <span class="app-icon">🏈</span>
          <span class="app-name">Bowl Pick'em</span>
        </a>
        <div class="divider"></div>
        <a
          href="/bracket-challenge"
          class="platform-item"
          (click)="closeMenu()"
        >
          <span class="app-icon">🏀</span>
          <span class="app-name">Bracket Challenge</span>
        </a>
      </div>
      
      <div class="menu-backdrop" *ngIf="showMenu" (click)="closeMenu()"></div>
    </div>
  `,
  styles: [`
    .platform-switcher-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .platform-menu-btn {
      width: 40px;
      height: 40px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      z-index: 1002;
      margin-right: 12px;

      span {
        width: 24px;
        height: 2px;
        background-color: white;
        transition: all 0.3s ease;
        display: block;
      }

      &.open span:nth-child(1) {
        transform: rotate(45deg) translate(8px, 8px);
      }

      &.open span:nth-child(2) {
        opacity: 0;
      }

      &.open span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -7px);
      }
    }

    .platform-menu {
      position: fixed;
      top: 0;
      left: 0;
      width: 240px;
      background-color: rgba(0, 0, 0, 0.95);
      border-right: 2px solid #014d0e;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
      z-index: 1003;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &.open {
        transform: translateX(0);
      }
    }

    .platform-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      padding: 16px;
      padding-left: 24px;
      color: white;
      text-decoration: none;
      transition: background-color 0.2s;
      border-left: 3px solid transparent;

      .app-name {
        font-weight: 500;
        font-size: 14px;
      }

      .app-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      &:hover {
        background-color: rgba(1, 77, 14, 0.2);
      }

      &.active {
        border-left-color: #014d0e;
        background-color: rgba(1, 77, 14, 0.1);
      }
    }

    .divider {
      height: 1px;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .menu-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      background-color: transparent;
    }
  `]
})
export class PlatformSwitcherComponent {
  showMenu = false;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}

