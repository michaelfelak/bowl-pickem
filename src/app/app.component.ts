import { Component } from '@angular/core';
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
  public showAdmin = false;
  public showSubmit = false;
  public currentUser$: Observable<string | null>;
  public currentUserEmail = '';
  public isAuthenticated = false;

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
    });
    this.showSubmit = this.settingService.showSubmitEntry;
    this.titleService.setTitle("Bowl Pick'em - Home");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    // check if admin
    if (id === '89310bc3-d828-ae83-11bb-7bc89ea3ab21') {
      this.showAdmin = true;
      console.log('Logged in as administrator');
    }
    if (id === '784920abf-e832-bddb-88ae-7ac89ea3ab21'){
      this.showSubmit = true;
    }
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }

  login(): void {
    this.router.navigate(['/login']);
  }
}
