import { Component } from '@angular/core';
import { SkyAppConfig, SkyuxConfig } from '@skyux/config';

@Component({
  selector: 'my-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  public currentYear: number = 2024;
  public years: number[] = [2019, 2020, 2021, 2022, 2023, 2024];

  public updateYear(year: number) {
    this.currentYear = year;
  }
}
