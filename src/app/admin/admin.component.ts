import { Component } from '@angular/core';
import { AddBowlComponent } from './add-bowl/add-bowl.component';
import { AddBowlGameComponent } from './add-bowl-game/add-bowl-game.component';
import { PaidStatusComponent } from './paid-status/paid-status.component';
import { UpdateScoresComponent } from './update-scores/update-scores.component';
import { TiebreakersComponent } from './tiebreakers/tiebreakers.component';
import { BowlService } from '../shared/services/bowl.service';
import { AddPlayoffSchoolComponent } from './add-playoff-school/add-playoff-school.component';

@Component({
  standalone: true,
  selector: 'app-my-admin',
  imports: [
    AddBowlComponent,
    AddBowlGameComponent,
    AddPlayoffSchoolComponent,
    PaidStatusComponent,
    UpdateScoresComponent,
    TiebreakersComponent,
    AddPlayoffSchoolComponent,
  ],
  providers: [BowlService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  public currentYear = 2024;
  public years: number[] = [2019, 2020, 2021, 2022, 2023, 2024];

  public updateYear(year: number) {
    this.currentYear = year;
  }
}
