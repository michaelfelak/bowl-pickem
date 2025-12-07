import { Component } from '@angular/core';
import { AddBowlComponent } from './add-bowl/add-bowl.component';
import { AddBowlGameComponent } from './add-bowl-game/add-bowl-game.component';
import { PaidStatusComponent } from './paid-status/paid-status.component';
import { UpdateScoresComponent } from './update-scores/update-scores.component';
import { TiebreakersComponent } from './tiebreakers/tiebreakers.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { BowlService } from '../shared/services/bowl.service';
import { AddPlayoffSchoolComponent } from './add-playoff-school/add-playoff-school.component';
import { SettingsService } from '../shared/services/settings.service';
import { AddPlayoffResultComponent } from './add-playoff-result/add-playoff-result.component';
import { SkyRepeaterModule } from '@skyux/lists';

@Component({
  standalone: true,
  selector: 'app-my-admin',
  imports: [
    SkyRepeaterModule,
    AddBowlComponent,
    AddBowlGameComponent,
    AddPlayoffSchoolComponent,
    PaidStatusComponent,
    UpdateScoresComponent,
    TiebreakersComponent,
    AddPlayoffResultComponent,
    AddBlogComponent,
  ],
  providers: [BowlService, SettingsService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  public currentYear: number;
  public years: number[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  public entrantsMessage: string = '';

  constructor(private settingsSvc: SettingsService) {
    this.currentYear = this.settingsSvc.currentYear;
  }

  public updateYear(year: number) {
    this.currentYear = year;
  }
}
