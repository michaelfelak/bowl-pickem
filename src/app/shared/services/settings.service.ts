import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
  public currentYear: number = 2025;
  public showSubmitEntry: boolean = true;
  public showStandingsFlyout: boolean = true;

  // Base URLs for API endpoints
  public authApiUrl: string = 'https://bowl-pickem-144ffdd934e7.herokuapp.com/api/auth'; // prod
  // public authApiUrl: string = 'http://localhost:8081/api/auth';
  public bowlApiUrl = 'https://bowl-pickem-144ffdd934e7.herokuapp.com/api/v1/'; // prod
  // public bowlApiUrl: string = 'http://localhost:8081/api/v1/';
}
