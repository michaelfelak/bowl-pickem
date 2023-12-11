import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Bowl,
  Game,
  School,
  PickRequest,
  Entry,
  EntryRequest,
  GameResultModel,
  StandingsEntry,
  CompletedEntry,
  AnalysisRecord,
  TodaysGame,
  BlogEntry,
  BowlPick
} from './bowl.model';

@Injectable()
export class BowlService {
  private baseUrl: string;
  private currentYear: string;

  constructor(private http: HttpClient) {
    this.baseUrl = 'https://bowl-pickem-15ea7b3ae3e0.herokuapp.com/api/v1/';
    this.currentYear = '2023';
  }

  public getUserList() {
    return this.http.get(this.baseUrl + 'user/list');
  }

  public getBowlList(): Observable<Bowl[]> {
    return this.http.get<Bowl[]>(this.baseUrl + 'bowl/list');
  }

  public addBowl(request: any): Observable<any> {
    return this.http.post(this.baseUrl + 'bowl/add', request);
  }

  public addGame(request: Game): Observable<any> {
    return this.http.post(this.baseUrl + 'game/add', request);
  }

  public addEntry(request: EntryRequest): Observable<string> {
    return this.http.post<string>(this.baseUrl + 'entry/add', request);
  }

  public getGames(year: string): Observable<Game[]> {
    return this.http.get<Game[]>(this.baseUrl + 'game/list/' + year);
  }

  public getGameResults(year: string): Observable<GameResultModel[]> {
    return this.http.get<GameResultModel[]>(
      this.baseUrl + 'gameresults/list/' + year
    );
  }

  public addGameResult(request: GameResultModel): Observable<any> {
    return this.http.post(this.baseUrl + 'gameresult/add', request);
  }

  public getSchools(): Observable<School[]> {
    return this.http.get<School[]>(this.baseUrl + 'school/list');
  }

  public submit(req: PickRequest): Observable<any> {
    return this.http.post(this.baseUrl + 'picks/add', req);
  }

  public togglePaid(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'entry/paid/' + id);
  }

  public getEntries(): Observable<Entry[]> {
    return this.http.get<Entry[]>(
      this.baseUrl + 'entry/list/' + this.currentYear
    );
  }

  public deleteEntry(id: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + 'entry/delete/' + id);
  }

  public getStandings(year: number): Observable<StandingsEntry[]> {
    return this.http.get<StandingsEntry[]>(this.baseUrl + 'standings/' + year);
  }

  public getStandingsEntry(id: string | undefined): Observable<CompletedEntry> {
    return this.http.get<CompletedEntry>(this.baseUrl + 'completedentry/' + id);
  }

  public getAnalysis(year: string): Observable<AnalysisRecord[]> {
    return this.http.get<AnalysisRecord[]>(this.baseUrl + 'analysis/' + year);
  }

  public getTodaysGames(): Observable<TodaysGame[]> {
    return this.http.get<TodaysGame[]>(this.baseUrl + 'todaysgames');
  }

  public getBlogEntries(): Observable<BlogEntry[]> {
    return this.http.get<BlogEntry[]>(
      this.baseUrl + 'blogentry/list/' + this.currentYear
    );
  }

  public getBowlPicks(bowlId: string): Observable<BowlPick[]> {
    return this.http.get<BowlPick[]>(this.baseUrl + 'bowlpicks/' + bowlId);
  }
}
