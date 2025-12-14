import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constants';
import { PageVisit, PageVisitFilter, PageVisitSummary, UserPageVisitSummary } from './page-visit.model';

@Injectable({
  providedIn: 'root',
})
export class PageVisitService {
  private apiUrl = `${API_CONSTANTS.BOWL_API_URL}pagevisit`;
  private lastVisits: Map<string, number> = new Map();
  private readonly VISIT_COOLDOWN_MS = 10000; // 10 seconds

  constructor(private http: HttpClient) {}

  /**
   * Add a new page visit record
   * Implements a 10-second cooldown per user per page to prevent database overload
   * Multiple users are tracked separately
   * @param pageVisit - The page visit data to record
   * @returns Observable of the created page visit
   */
  public addPageVisit(pageVisit: PageVisit): Observable<PageVisit> {
    const key = `${pageVisit.user_id}:${pageVisit.page}`;
    const now = Date.now();
    const lastVisit = this.lastVisits.get(key) || 0;
    
    // Only log if it's been more than 10 seconds since last visit to this page by this user
    if (now - lastVisit > this.VISIT_COOLDOWN_MS) {
      this.lastVisits.set(key, now);
      return this.http.post<PageVisit>(this.apiUrl, pageVisit);
    }
    
    // Return empty observable if within cooldown period
    return of({} as PageVisit);
  }

  /**
   * Get page visit summaries
   * @returns Observable of page visit summary data
   */
  public getPageVisitSummaries(): Observable<PageVisitSummary[]> {
    return this.http.get<PageVisitSummary[]>(
      `${API_CONSTANTS.BOWL_API_URL}pagevisits`
    );
  }

  /**
   * Get filtered page visits
   * @param filter - Filter criteria for page visits
   * @returns Observable of filtered page visit data
   */
  public getPageVisitsFiltered(
    filter: PageVisitFilter
  ): Observable<PageVisit[]> {
    return this.http.get<PageVisit[]>(
      `${API_CONSTANTS.BOWL_API_URL}pagevisits/filter`,
      {
        params: this.buildFilterParams(filter),
      }
    );
  }

  /**
   * Build query parameters from filter object
   * Only includes parameters that are defined
   * @param filter - The filter object
   * @returns Object with query parameters
   */
  private buildFilterParams(filter: PageVisitFilter): {
    [key: string]: string | number | boolean;
  } {
    const params: { [key: string]: string | number | boolean } = {};

    if (filter.start_date) {
      params['start_date'] = filter.start_date.toISOString();
    }
    if (filter.end_date) {
      params['end_date'] = filter.end_date.toISOString();
    }
    if (filter.user_id) {
      params['user_id'] = filter.user_id;
    }
    if (filter.page) {
      params['page'] = filter.page;
    }
    if (filter.action) {
      params['action'] = filter.action;
    }

    return params;
  }

  /**
   * Get user page visit summaries
   * @returns Observable of user page visit summary data
   */
  public getPageVisitsByUserSummary(): Observable<UserPageVisitSummary[]> {
    return this.http.get<UserPageVisitSummary[]>(
      `${API_CONSTANTS.BOWL_API_URL}pagevisits/user/summary`
    );
  }

  /**
   * Get page visits by user
   * @param userId - Optional user ID to filter by
   * @returns Observable of page visits by user
   */
  public getPageVisitsByUser(userId?: number): Observable<PageVisit[]> {
    const params: { [key: string]: string | number } = {};
    if (userId) {
      params['user_id'] = userId;
    }

    return this.http.get<PageVisit[]>(
      `${API_CONSTANTS.BOWL_API_URL}pagevisits/user`,
      { params }
    );
  }
}
