import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
  public currentYear: number = 2024;
  public showSubmitEntry: boolean = true;
  public serviceUrl: string = 'https://bowl-pickem-15ea7b3ae3e0.herokuapp.com/api/v1/';
  public localServiceUrl: string = 'http://localhost:8081/api/v1/';
}
