import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BowlService } from '../../shared/services/bowl.service';
import { AuthService } from '../../shared/services/auth.service';
import {
  Entry,
  PickModel,
  Game,
  CompletedEntry,
  CompletedPick,
} from '../../shared/services/bowl.model';
import { SkyWaitService, SkyAlertModule } from '@skyux/indicators';
import { StatusIndicatorComponent } from '../../shared/status-indicator/status-indicator.component';
import * as dayjs from 'dayjs';
import { SettingsService } from '../../shared/services/settings.service';

interface PickDisplay extends CompletedPick {
  gameLabel?: string;
  gameTime?: string;
  isPicked?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-view-entry',
  imports: [
    CommonModule,
    RouterModule,
    SkyAlertModule,
    StatusIndicatorComponent,
  ],
  providers: [SettingsService],
  templateUrl: './view-entry.component.html',
  styleUrls: ['./view-entry.component.scss'],
})
export class ViewEntryComponent implements OnInit {
  public entry: Entry | null = null;
  public picks: PickDisplay[] = [];
  public games: Game[] = [];
  public isLoading = true;
  public showError = false;
  public errorMsg: string = '';
  public entryId: string = '';
  public currentYear: number = 0;

  constructor(
    private titleService: Title,
    private bowlService: BowlService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private waitService: SkyWaitService,
    private settings: SettingsService
  ) {
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.entryId) {
      this.handleError('Entry ID not found');
      return;
    }

    this.titleService.setTitle("View Entry - Bowl Pick'em");

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  private loadData(): void {
    this.waitService.beginNonBlockingPageWait();

    // Load games and completed entry data in parallel
    Promise.all([
      this.bowlService.getGames(this.currentYear).toPromise(),
      this.bowlService.getStandingsEntry(this.entryId).toPromise(),
    ])
      .then(([games, completedEntry]) => {
        this.games = games || [];
        this.entry = completedEntry as unknown as Entry;
        this.processPicks(completedEntry?.picks || []);
        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
      })
      .catch((error) => {
        this.handleError('Failed to load entry details');
        console.error('Error loading entry:', error);
        this.waitService.endNonBlockingPageWait();
        this.isLoading = false;
      });
  }

  /**
   * Process picks to add game information and formatting
   */
  private processPicks(picks: CompletedPick[]): void {
    this.picks = picks.map((pick) => {
      return {
        ...pick,
        gameLabel: this.getGameLabel(pick),
        gameTime: this.formatGameTime(pick.game_time),
        isPicked: !!(pick.team_1 || pick.team_2),
      };
    });
  }

  /**
   * Get a readable game label (just the bowl name)
   */
  private getGameLabel(pick: CompletedPick): string {
    return pick.bowl_name || 'TBD';
  }

  /**
   * Get the picked team name
   */
  public getPickedTeam(pick: CompletedPick): string {
    if (pick.team_1 && pick.team_1_name) {
      return pick.team_1_name;
    } else if (pick.team_2 && pick.team_2_name) {
      return pick.team_2_name;
    }
    return 'Not Picked';
  }

  /**
   * Get points display with label
   */
  public getPointsDisplay(points: number | undefined): string {
    if (!points) return '0 pts';
    return `${points} pt${points !== 1 ? 's' : ''}`;
  }

  /**
   * Get combined pick and points display
   */
  public getPickWithPoints(pick: PickModel): string {
    const team = this.getPickedTeam(pick);
    const points = pick.points || 0;
    return `${team} (${points} pts)`;
  }

  /**
   * Go back to entries list
   */
  public goBack(): void {
    this.router.navigate(['/my-entries']);
  }

  private handleError(message: string): void {
    this.errorMsg = message;
    this.showError = true;
  }

  public formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM DD, YYYY');
  }

  public formatGameTime(gameTime: string | undefined): string {
    if (!gameTime) return 'TBD';
    return dayjs(gameTime).format('MMM DD, YYYY h:mm A');
  }

  /**
   * Check if a pick has negative points
   */
  public isNegativePoints(pick: PickDisplay): boolean {
    const points = pick.earned_points ?? pick.points ?? 0;
    return points < 0;
  }
}
