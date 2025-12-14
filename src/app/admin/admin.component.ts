import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddBowlComponent } from './add-bowl/add-bowl.component';
import { AddBowlGameComponent } from './add-bowl-game/add-bowl-game.component';
import { PaidStatusComponent } from './paid-status/paid-status.component';
import { UpdateScoresComponent } from './update-scores/update-scores.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { BowlService } from '../shared/services/bowl.service';
import { AddPlayoffSchoolComponent } from './add-playoff-school/add-playoff-school.component';
import { SettingsService } from '../shared/services/settings.service';
import { AddPlayoffResultComponent } from './add-playoff-result/add-playoff-result.component';

interface AdminSection {
  id: string;
  title: string;
  component: any;
}

@Component({
  standalone: true,
  selector: 'app-my-admin',
  imports: [
    CommonModule,
    AddBowlComponent,
    AddBowlGameComponent,
    AddPlayoffSchoolComponent,
    PaidStatusComponent,
    UpdateScoresComponent,
    AddPlayoffResultComponent,
    AddBlogComponent,
  ],
  providers: [BowlService, SettingsService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  public currentYear: number = 0;
  public years: number[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  public entrantsMessage: string = '';
  public selectedSection: string | null = null;

  public sections: AdminSection[] = [
    { id: 'blog', title: 'Post Blog', component: AddBlogComponent },
    { id: 'paid-status', title: 'Update Paid Status', component: PaidStatusComponent },
    { id: 'scores', title: 'Update Scores', component: UpdateScoresComponent },
    { id: 'playoff-result', title: 'Championship Results', component: AddPlayoffResultComponent },
    { id: 'add-bowl', title: 'Add Bowl', component: AddBowlComponent },
    { id: 'add-game', title: 'Add Bowl Game', component: AddBowlGameComponent },
    { id: 'add-school', title: 'Add Playoff School', component: AddPlayoffSchoolComponent },
  ];

  constructor(private settingsSvc: SettingsService) {
    this.settingsSvc.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  public selectSection(sectionId: string): void {
    this.selectedSection = sectionId;
  }

  public goBack(): void {
    this.selectedSection = null;
  }

  public updateYear(year: number) {
    this.currentYear = year;
  }

  public getSelectedSection(): AdminSection | undefined {
    return this.sections.find(s => s.id === this.selectedSection);
  }
}
