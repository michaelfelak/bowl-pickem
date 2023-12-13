import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public showAdmin: boolean = false;

  constructor(private titleService: Title) {
    this.titleService.setTitle("Bowl Pick'em - Home");
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
