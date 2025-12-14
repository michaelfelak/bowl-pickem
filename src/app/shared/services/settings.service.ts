import { Injectable } from '@angular/core';
import { BowlService } from './bowl.service';
import { Settings } from './bowl.model';
import { API_CONSTANTS } from '../constants/api.constants';
import { BONUS_GAMES } from '../constants/bowl.constants';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // public currentYear: number = 0;
  // public showSubmitEntry: boolean = false;
  // public showStandingsFlyout: boolean = true;

  public settings$: Observable<Settings>;

  constructor(private bowlService: BowlService) {
    // Cache the settings observable so it's only fetched once
    this.settings$ = this.bowlService.getSettings().pipe(shareReplay(1));

    // this.settings$.subscribe((settings: Settings) => {
    //   this.currentYear = settings.current_year;
    //   this.showSubmitEntry = settings.submit_entry_enabled;
    // });
  }

  /**
   * Determines if a bowl game is a bonus game (eligible for 10-point assignment)
   * @param name The name of the bowl game
   * @returns true if the bowl is a bonus game
   */
  public isBonusGame(name: string): boolean {
    return BONUS_GAMES.includes(name);
  }
}
