import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss']
})
export class AppNavComponent implements OnInit {
  public nav = [
    {
      titleKey: 'app_nav_home',
      path: '/'
    }
  ];
  // constructor(private config: SkyAppConfig) {}

  public ngOnInit() {
    // if (this.config.skyux.appSettings.showSubmitEntry) {
    this.nav.push({
      titleKey: 'app_nav_picks',
      path: '/picks'
    });
    // }

    this.nav.push({
      titleKey: 'app_nav_standings',
      path: '/standings'
    });

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    // check if admin
    // if (
    //   this.config.skyux.appSettings.showAdmin ||
    //   id === '89310bc3-d828-ae83-11bb-7bc89ea3ab21'
    // ) {
    console.log('Logged in as administrator');
    this.nav.push({
      titleKey: 'app_nav_admin',
      path: '/admin'
    });
    // }

    this.nav.push({
      titleKey: 'app_nav_about',
      path: '/about'
    });
  }
}
