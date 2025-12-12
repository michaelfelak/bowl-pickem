import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BowlService } from '../shared/services/bowl.service';
import { AuthService } from '../shared/services/auth.service';
import { Entry, PickModel, Game } from '../shared/services/bowl.model';
import { SkyWaitService, SkyAlertModule } from '@skyux/indicators';
import * as dayjs from 'dayjs';
import { SettingsService } from '../shared/services/settings.service';

interface EntryWithEditable extends Entry {
  isEditable?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-my-entries',
  imports: [CommonModule, RouterModule, SkyAlertModule],
  providers: [SettingsService],
  templateUrl: './my-entries.component.html',
  styleUrls: ['./my-entries.component.scss'],
})
export class MyEntriesComponent implements OnInit {
  public entries: EntryWithEditable[] = [];
  public isAuthenticated = false;
  public isAdmin = false;
  public currentYear: number;
  public isLoading = true;
  public showError = false;
  public errorMsg: string = '';
  private games: Game[] = [];
  public username: string = '';
  public email: string = '';
  public competingSince: number | null = null;
  public totalEntries: number = 0;

  constructor(
    private titleService: Title,
    private bowlService: BowlService,
    private authService: AuthService,
    private router: Router,
    private waitService: SkyWaitService,
    private settings: SettingsService
  ) {
    this.currentYear = this.settings.currentYear;
    const userId = this.authService.getCurrentUserId();
    const userIdStr = userId ? userId.toString() : null;
    this.isAdmin = userIdStr === '2' || userIdStr === '3';
  }

  ngOnInit(): void {
    this.titleService.setTitle('My Profile - Bowl Pick\'em');
    
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserInfo();
    this.loadData();
  }

  private loadUserInfo(): void {
    this.username = this.authService.getCurrentUsername() || '';
    this.email = this.authService.getCurrentUserEmail() || '';
  }

  private loadData(): void {
    this.waitService.beginNonBlockingPageWait();
    
    // Load games first to check which are editable
    this.bowlService.getGames(this.currentYear).subscribe({
      next: (games) => {
        this.games = games;
        this.loadEntries();
      },
      error: (error) => {
        this.handleError('Failed to load games');
        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
      }
    });
  }

  private loadEntries(): void {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.handleError('User ID not found. Please log in again.');
      this.waitService.endNonBlockingPageWait();
      this.isLoading = false;
      return;
    }

    // Load user's entries from API
    this.bowlService.getUserEntries(userId).subscribe({
      next: (entries) => {
        this.entries = entries.map(entry => ({
          ...entry,
          isEditable: this.isEntryEditable(entry)
        }));
        this.totalEntries = this.entries.length;
        this.updateCompetingSince();
        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to load entries');
        console.error('Error loading entries:', error);
        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
      }
    });
  }

  /**
   * Determine if an entry is editable based on year
   * Entries from previous years are read-only
   */
  private isEntryEditable(entry: Entry): boolean {
    // Only allow editing entries from the current year
    return entry.year === this.currentYear;
  }

  public editEntry(entry: EntryWithEditable): void {
    if (entry.isEditable) {
      // Navigate to edit page with entry ID
      this.router.navigate(['/my-entries', entry.id, 'edit']);
    } else {
      // Navigate to view-only page for locked entries
      this.router.navigate(['/my-entries', entry.id, 'view']);
    }
  }

  public deleteEntry(entry: EntryWithEditable): void {
    // Prevent deletion of entries from previous years
    if (entry.year && entry.year !== this.currentYear) {
      this.handleError('Cannot delete entries from previous years. Only current year entries can be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${entry.name}"?`)) {
      this.waitService.beginNonBlockingPageWait();
      this.bowlService.deleteEntry(entry.id!).subscribe({
        next: () => {
          this.entries = this.entries.filter(e => e.id !== entry.id);
          this.waitService.endNonBlockingPageWait();
        },
        error: (error) => {
          this.handleError('Failed to delete entry');
          this.waitService.endNonBlockingPageWait();
        }
      });
    }
  }

  public login(): void {
    this.router.navigate(['/login']);
  }

  private handleError(message: string): void {
    this.errorMsg = message;
    this.showError = true;
  }

  public formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM DD, YYYY');
  }

  private updateCompetingSince(): void {
    if (this.entries.length === 0) {
      this.competingSince = null;
      return;
    }

    const years = this.entries
      .map(entry => entry.year)
      .filter((year): year is number => year !== undefined && year !== null);

    if (years.length === 0) {
      this.competingSince = null;
      return;
    }

    this.competingSince = Math.min(...years);
  }
}
