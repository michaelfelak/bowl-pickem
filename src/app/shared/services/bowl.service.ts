import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';
import {
  Bowl,
  Game,
  School,
  PickRequest,
  PickModel,
  Entry,
  EntryRequest,
  GameResultModel,
  StandingsEntry,
  CompletedEntry,
  AnalysisRecord,
  TodaysGame,
  BlogEntry,
  BowlPick,
  Tiebreaker,
  PlayoffPickRequest,
  PlayoffSchoolRequest,
  PlayoffSchool,
  PlayoffResult as AddPlayoffResultRequest,
  PlayoffPick,
  PlayoffPickFlyout,
} from './bowl.model';

@Injectable()
export class BowlService {
  private baseUrl: string;

  constructor(private http: HttpClient, private settingsService: SettingsService) {
    this.baseUrl = this.settingsService.bowlApiUrl;
  }

  // ============================================
  // Schools endpoints
  // ============================================

  /**
   * Get all schools
   */
  public getSchools(): Observable<School[]> {
    return this.http.get<School[]>(`${this.baseUrl}school/list`);
  }

  // ============================================
  // Bowls endpoints
  // ============================================

  /**
   * Get all bowls
   */
  public getBowlList(): Observable<Bowl[]> {
    return this.http.get<Bowl[]>(`${this.baseUrl}bowl/list`);
  }

  /**
   * Add a new bowl
   */
  public addBowl(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}bowl/add`, request);
  }

  /**
   * Get bowl picks by bowl ID
   */
  public getBowlPicks(bowlId: string): Observable<BowlPick[]> {
    return this.http.get<BowlPick[]>(`${this.baseUrl}bowlpicks/${bowlId}`);
  }

  // ============================================
  // Games endpoints
  // ============================================

  /**
   * Get games for a specific year
   * @param year The year to retrieve games for
   */
  public getGames(year: number): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}game/list/${year}`);
  }

  /**
   * Add a new game
   */
  public addGame(request: Game): Observable<any> {
    return this.http.post(`${this.baseUrl}game/add`, request);
  }

  /**
   * Get game results for a specific year
   */
  public getGameResults(year: number): Observable<GameResultModel[]> {
    return this.http.get<GameResultModel[]>(
      `${this.baseUrl}gameresults/list/${year}`
    );
  }

  /**
   * Add a game result
   */
  public addGameResult(request: GameResultModel): Observable<any> {
    return this.http.post(`${this.baseUrl}gameresult/add`, request);
  }

  // ============================================
  // Picks endpoints
  // ============================================

  /**
   * Submit picks for an entry
   */
  public submit(req: PickRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}picks/add`, req);
  }

  // ============================================
  // Playoff endpoints
  // ============================================

  /**
   * Add playoff picks
   */
  public addPlayoffPicks(req: PlayoffPickRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}playoffpicks/add`, req);
  }

  /**
   * Get playoff pick data for flyout display
   */
  public getPlayoffPickForFlyout(
    entryId: string
  ): Observable<PlayoffPickFlyout> {
    return this.http.get<PlayoffPickFlyout>(
      `${this.baseUrl}playoffpicks/flyout/${entryId}`
    );
  }

  /**
   * Add a playoff school
   */
  public addPlayoffSchool(req: PlayoffSchoolRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}playoffschool/add`, req);
  }

  /**
   * Get playoff schools for a specific year
   */
  public getPlayoffSchools(year: number): Observable<PlayoffSchool[]> {
    return this.http.get<PlayoffSchool[]>(
      `${this.baseUrl}playoffschool/list/${year}`
    );
  }

  /**
   * Add a playoff result
   */
  public addPlayoffResult(
    request: AddPlayoffResultRequest
  ): Observable<AddPlayoffResultRequest[]> {
    return this.http.post<AddPlayoffResultRequest[]>(
      `${this.baseUrl}playoffschool/list/`,
      request
    );
  }

  // ============================================
  // Entries endpoints
  // ============================================

  /**
   * Get all entries for a specific year
   */
  public getEntries(year: number): Observable<Entry[]> {
    return this.http.get<Entry[]>(`${this.baseUrl}entry/list/${year}`);
  }

  /**
   * Add a new entry
   */
  public addEntry(request: EntryRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}entry/add`, request);
  }

  /**
   * Delete an entry by ID
   */
  public deleteEntry(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}entry/delete/${id}`);
  }

  /**
   * Toggle paid status for an entry
   */
  public togglePaid(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}entry/paid/${id}`);
  }

  /**
   * Get user list (admin endpoint)
   */
  public getUserList(): Observable<any> {
    return this.http.get(`${this.baseUrl}user/list`);
  }

  // ============================================
  // User Entries endpoints (My Entries feature)
  // ============================================

  /**
   * Get all entries for a specific user
   * @param userId The user ID
   */
  public getUserEntries(userId: string): Observable<Entry[]> {
    return this.http.get<Entry[]>(`${this.baseUrl}user/${userId}/entries`);
  }

  /**
   * Get a specific user's entry for a given year
   * @param userId The user ID
   * @param year The year
   */
  public getUserEntryForYear(userId: string, year: number): Observable<Entry> {
    return this.http.get<Entry>(`${this.baseUrl}user/${userId}/entry/${year}`);
  }

  /**
   * Get entry with all picks data
   * @param entryId The entry ID
   */
  public getEntryWithPicks(entryId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}entry/${entryId}`);
  }

  /**
   * Save entry with picks and tiebreakers
   * @param entry The entry data to save (must include entry_id and picks)
   */
  public saveEntry(entry: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}entry/save`, entry);
  }

  /**
   * Update entry picks
   * @param entryId The entry ID
   * @param picks The array of picks to update
   */
  public updateEntryPicks(
    entryId: string,
    picks: PickModel[]
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}entry/${entryId}`, { picks });
  }

  /**
   * Update entry tiebreakers
   * @param entryId The entry ID
   * @param tiebreaker1 First tiebreaker value
   * @param tiebreaker2 Second tiebreaker value
   */
  public updateEntryTiebreakers(
    entryId: string,
    tiebreaker1: number,
    tiebreaker2: number
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}entry/${entryId}/tiebreakers`, {
      tiebreaker_1: tiebreaker1,
      tiebreaker_2: tiebreaker2,
    });
  }

  /**
   * Update entire entry (picks + tiebreakers)
   * @param entryId The entry ID
   * @param entry Partial entry object with updates
   */
  public updateEntry(entryId: string, entry: Partial<Entry>): Observable<any> {
    return this.http.put(`${this.baseUrl}entry/${entryId}`, entry);
  }

  // ============================================
  // Standings endpoints
  // ============================================

  /**
   * Get standings for a specific year
   */
  public getStandings(year: number): Observable<StandingsEntry[]> {
    return this.http.get<StandingsEntry[]>(`${this.baseUrl}standings/${year}`);
  }

  /**
   * Get tiebreakers for a specific year
   */
  public getTiebreakers(year: number): Observable<Tiebreaker[]> {
    return this.http.get<Tiebreaker[]>(`${this.baseUrl}tiebreakers/${year}`);
  }

  /**
   * Get completed entry (standings entry with picks)
   */
  public getStandingsEntry(id: string | undefined): Observable<CompletedEntry> {
    return this.http.get<CompletedEntry>(`${this.baseUrl}completedentry/${id}`);
  }

  // ============================================
  // Analysis endpoints
  // ============================================

  /**
   * Get analysis data for a specific year
   */
  public getAnalysis(year: string): Observable<AnalysisRecord[]> {
    return this.http.get<AnalysisRecord[]>(`${this.baseUrl}analysis/${year}`);
  }

  // ============================================
  // Blog endpoints
  // ============================================

  /**
   * Get blog entries for a specific year
   */
  public getBlogEntries(year: number): Observable<BlogEntry[]> {
    return this.http.get<BlogEntry[]>(`${this.baseUrl}blogentry/list/${year}`);
  }

  /**
   * Add a new blog entry
   */
  public addBlogEntry(
    blogEntry: BlogEntry,
    year: number
  ): Observable<BlogEntry> {
    return this.http.post<BlogEntry>(
      `${this.baseUrl}blogentry/create/${year}`,
      blogEntry
    );
  }

  public deleteBlogEntry(blogId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}blogentry/${blogId}`);
  }

  // ============================================
  // Today's Games endpoints
  // ============================================

  /**
   * Get today's games
   */
  public getTodaysGames(): Observable<TodaysGame[]> {
    return this.http.get<TodaysGame[]>(`${this.baseUrl}todaysgames`);
  }
}
