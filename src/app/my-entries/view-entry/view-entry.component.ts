import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BowlService } from '../../shared/services/bowl.service';
import { AuthService } from '../../shared/services/auth.service';
import { Entry, PickModel, Game } from '../../shared/services/bowl.model';
import { SkyWaitService, SkyAlertModule } from '@skyux/indicators';
import * as dayjs from 'dayjs';
import { SettingsService } from '../../shared/services/settings.service';

interface PickDisplay extends PickModel {
  gameLabel?: string;
  gameTime?: string;
  isPicked?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-view-entry',
  imports: [CommonModule, RouterModule, SkyAlertModule],
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
  public currentYear: number;

  constructor(
    private titleService: Title,
    private bowlService: BowlService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private waitService: SkyWaitService,
    private settings: SettingsService
  ) {
    this.currentYear = this.settings.currentYear;
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.entryId) {
      this.handleError('Entry ID not found');
      return;
    }

    this.titleService.setTitle('View Entry - Bowl Pick\'em');
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  private loadData(): void {
    this.waitService.beginNonBlockingPageWait();
    
    // Load games and entry data in parallel
    Promise.all([
      this.bowlService.getGames(this.currentYear).toPromise(),
      this.bowlService.getEntryWithPicks(this.entryId).toPromise()
    ])
      .then(([games, entryData]) => {
        console.log('Games data:', games);
        console.log('Entry with picks response:', entryData);
        console.log('Entry data structure:', JSON.stringify(entryData, null, 2));
        
        this.games = games || [];
        this.entry = entryData;
        this.processPicks(entryData?.picks || []);
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
  private processPicks(picks: PickModel[]): void {
    this.picks = picks.map(pick => {
      const game = this.games.find(g => g.ID === pick.game_id);
      
      console.log('Processing pick:', pick);
      console.log('  team_1:', pick.team_1_picked, 'team_2:', pick.team_2_picked);
      console.log('  team_1_name:', pick.team_1_name, 'team_2_name:', pick.team_2_name);
      console.log('  points:', pick.points);
      
      return {
        ...pick,
        gameLabel: this.getGameLabel(pick),
        gameTime: game?.GameTime ? dayjs(game.GameTime).format('MMM DD, YYYY h:mm A') : 'TBD',
        isPicked: !!(pick.team_1_picked || pick.team_2_picked)
      };
    });
  }

  /**
   * Get a readable game label (e.g., "Team1 vs Team2 - Bowl Name")
   */
  private getGameLabel(pick: PickModel): string {
    const vs = ' vs ';
    const team1 = pick.team_1_name || 'Team 1';
    const team2 = pick.team_2_name || 'Team 2';
    const bowl = pick.bowl_name ? ` - ${pick.bowl_name}` : '';
    
    return `${team1}${vs}${team2}${bowl}`;
  }

  /**
   * Get the picked team name
   */
  public getPickedTeam(pick: PickModel): string {
    console.log('getPickedTeam called with:', pick);
    console.log('  Checking team_1:', pick.team_1_picked, 'team_2:', pick.team_2_picked);
    
    if (pick.team_1_picked) {
      console.log('  -> Returning team_1_name:', pick.team_1_name);
      return pick.team_1_name || 'Team 1';
    } else if (pick.team_2_picked) {
      console.log('  -> Returning team_2_name:', pick.team_2_name);
      return pick.team_2_name || 'Team 2';
    }
    console.log('  -> Returning Not Picked');
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
}
