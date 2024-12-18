import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SettingsService } from './shared/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public showAdmin = false;
  public showSubmit = false;
  constructor(
    private titleService: Title,
    private settingService: SettingsService
  ) {
    this.showSubmit = this.settingService.showSubmitEntry;
    this.titleService.setTitle("Bowl Pick'em - Home");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    // check if admin
    if (id === '89310bc3-d828-ae83-11bb-7bc89ea3ab21') {
      this.showAdmin = true;
      console.log('Logged in as administrator');
    }
    if (id === '784920abf-e832-bddb-88ae-7ac89ea3ab21'){
      this.showSubmit = true;
    }
  }
}
