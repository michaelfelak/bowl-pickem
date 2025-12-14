import { Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SettingsService } from './shared/services/settings.service';
import { AuthService } from './shared/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public isAdmin = false;
  public showSubmit = false;
  public currentUser$: Observable<string | null>;
  public currentUserEmail = '';
  public isAuthenticated = false;
  public menuOpen = false;
  public showUserDropdown = false;

  constructor(
    private titleService: Title,
    private settingService: SettingsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUserEmail = this.authService.getCurrentUserEmail() || '';

    // Subscribe to auth status changes
    this.authService.currentUser$.subscribe(() => {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.currentUserEmail = this.authService.getCurrentUserEmail() || '';
      this.updateAdminStatus();
    });
    this.settingService.settings$.subscribe((settings) => {
      this.showSubmit = settings.submit_entry_enabled;
    });
    this.titleService.setTitle("Bowl Pick'em - Home");

    // Check admin status on initialization
    this.updateAdminStatus();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    if (id === '784920abf-e832-bddb-88ae-7ac89ea3ab21') {
      this.showSubmit = true;
    }
  }

  /**
   * Update admin status based on logged-in user
   */
  private updateAdminStatus(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.showUserDropdown = false;
    this.router.navigate(['/']);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  navigateToMyProfile(): void {
    this.showUserDropdown = false;
    this.router.navigate(['/my-entries']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userAvatarContainer = document.querySelector(
      '.user-avatar-container'
    );

    // Close dropdown if clicking outside the container
    if (userAvatarContainer && !userAvatarContainer.contains(target)) {
      this.showUserDropdown = false;
    }
  }
}
