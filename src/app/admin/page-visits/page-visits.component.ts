import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageVisitService } from '../../shared/services/page-visit.service';
import {
  PageVisit,
  PageVisitFilter,
  PageVisitSummary,
  UserPageVisitSummary,
} from '../../shared/services/page-visit.model';

@Component({
  standalone: true,
  selector: 'app-page-visits',
  imports: [CommonModule, FormsModule],
  templateUrl: './page-visits.component.html',
  styleUrls: ['./page-visits.component.scss'],
})
export class PageVisitsComponent implements OnInit {
  public summaries: PageVisitSummary[] = [];
  public filteredVisits: PageVisit[] = [];
  public userSummaries: UserPageVisitSummary[] = [];
  public userVisits: PageVisit[] = [];
  public showFiltered = false;
  public showUserSummary = false;
  public showUserVisits = false;
  public selectedUserId: number | undefined;
  public isLoading = false;

  // Filter fields
  public filter: PageVisitFilter = {
    start_date: undefined,
    end_date: undefined,
    user_id: undefined,
    page: undefined,
    action: undefined,
  };

  // UI fields
  public startDateString = '';
  public endDateString = '';
  public userId = '';
  public page = '';
  public action = '';

  constructor(private pageVisitService: PageVisitService) {}

  public ngOnInit() {
    this.loadSummaries();
    this.loadUserSummaries();
  }

  /**
   * Load user page visit summaries
   */
  public loadUserSummaries() {
    this.pageVisitService.getPageVisitsByUserSummary().subscribe({
      next: (summaries) => {
        this.userSummaries = summaries;
      },
      error: (error) => {
        console.error('Error loading user page visit summaries:', error);
      },
    });
  }

  /**
   * Load page visit summaries
   */
  public loadSummaries() {
    this.isLoading = true;
    this.pageVisitService.getPageVisitSummaries().subscribe({
      next: (summaries) => {
        console.log(summaries);
        this.summaries = summaries;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading page visit summaries:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Apply filters and load filtered page visits
   */
  public applyFilters() {
    this.filter = {
      start_date: this.startDateString
        ? new Date(this.startDateString)
        : undefined,
      end_date: this.endDateString ? new Date(this.endDateString) : undefined,
      user_id: this.userId ? parseInt(this.userId, 10) : undefined,
      page: this.page || undefined,
      action: this.action || undefined,
    };

    this.isLoading = true;
    this.pageVisitService.getPageVisitsFiltered(this.filter).subscribe({
      next: (visits) => {
        this.filteredVisits = visits;
        this.showFiltered = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading filtered page visits:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Load page visits for a specific user
   */
  public loadUserVisits(userId: number) {
    this.selectedUserId = userId;
    this.isLoading = true;
    this.pageVisitService.getPageVisitsByUser(userId).subscribe({
      next: (visits) => {
        this.userVisits = visits;
        this.showUserVisits = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user page visits:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Hide user visits view
   */
  public hideUserVisits() {
    this.showUserVisits = false;
    this.selectedUserId = undefined;
    this.userVisits = [];
  }

  /**
   * Clear filters and return to summaries view
   */
  public clearFilters() {
    this.startDateString = '';
    this.endDateString = '';
    this.userId = '';
    this.page = '';
    this.action = '';
    this.filter = {
      start_date: undefined,
      end_date: undefined,
      user_id: undefined,
      page: undefined,
      action: undefined,
    };
    this.showFiltered = false;
    this.loadSummaries();
  }
}
