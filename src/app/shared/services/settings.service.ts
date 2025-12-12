import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
  public currentYear: number = 2025;
  public showSubmitEntry: boolean = true;
  public showStandingsFlyout: boolean = true;

  // Base URLs for API endpoints
  public authApiUrl: string = 'https://bowl-pickem-144ffdd934e7.herokuapp.com/api/auth'; // prod
  public bowlApiUrl = 'https://bowl-pickem-144ffdd934e7.herokuapp.com/api/v1/'; // prod
  // public authApiUrl: string = 'http://localhost:8081/api/auth';
  // public bowlApiUrl: string = 'http://localhost:8081/api/v1/';

  /**
   * Determines if a bowl game is a bonus game (eligible for 10-point assignment)
   * @param name The name of the bowl game
   * @returns true if the bowl is a bonus game
   */
  public isBonusGame(name: string): boolean {
    const bonusGameNames = [
      'Military',
      'Pinstripe',
      'Fenway',
      'Pop-Tarts',
      'Arizona',
      'New Mexico',
      'Gator',
      'Texas',
    ];

    return bonusGameNames.includes(name);
  }
}
