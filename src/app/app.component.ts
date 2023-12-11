import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public showAdmin: boolean = false;
  title = 'bowl-pickem-spa';

  constructor() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    // check if admin
    if (id === '89310bc3-d828-ae83-11bb-7bc89ea3ab21'
    ) {
      this.showAdmin = true;
      console.log('Logged in as administrator');
    }
  }
}
