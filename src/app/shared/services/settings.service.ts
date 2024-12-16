import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
  public currentYear: number = 2024;
  public showSubmitEntry: boolean = false;
  public showStandingsFlyout: boolean = true;
}
