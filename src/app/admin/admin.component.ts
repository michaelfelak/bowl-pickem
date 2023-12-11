import { Component } from '@angular/core';

@Component({
  selector: 'my-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  public currentYear: number = 2023;
  public years: number[] = [2019, 2020, 2021, 2022, 2023];

  public updateYear(year: number) {
    this.currentYear = year;
  }
}
