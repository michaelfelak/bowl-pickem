import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
  public currentYear: number = 2024;
  public showSubmitEntry: boolean = true;
  public showStandingsFlyout: boolean = true;
}
