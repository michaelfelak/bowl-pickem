import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { AuthService } from '../../shared/services/auth.service';
import {
  CompletedEntry,
  CompletedPick,
  PlayoffPickFlyout,
} from '../../shared/services/bowl.model';
import { StandingsFlyoutContext } from './standings-flyout.context';
import { CommonModule } from '@angular/common';
import { mergeMap } from 'rxjs';
import { StatusIndicatorComponent } from '../../shared/status-indicator/status-indicator.component';

@Component({
  standalone: true,
  selector: 'app-standings-flyout',
  imports: [CommonModule, StatusIndicatorComponent],
  templateUrl: './standings-flyout.component.html',
  styleUrls: ['./standings-flyout.component.scss'],
})
export class StandingsFlyoutComponent implements OnInit {
  public entry!: CompletedEntry;
  public picks: CompletedPick[] = [];
  public name!: string;
  public points = 0;
  public allBowlGamesPlayed = false;
  public isAdmin = false;

  constructor(
    public context: StandingsFlyoutContext,
    private svc: BowlService,
    private authService: AuthService
  ) {
    const userId = this.authService.getCurrentUserId();
    const userIdStr = userId ? userId.toString() : null;
    this.isAdmin = userIdStr === '2' || userIdStr === '3';
  }

  public playoffPicks: PlayoffPickFlyout = {};

  public isGameInFuture(gameTime?: string): boolean {
    if (!gameTime) {
      return false; // Show picks without game_time
    }
    const now = new Date();
    const gameDate = new Date(gameTime);
    return gameDate > now;
  }

  public checkIfAllBowlGamesPlayed(): boolean {
    if (!this.entry.picks || this.entry.picks.length === 0) {
      return false;
    }
    
    // Check if all picks have been played (no future games)
    const now = new Date();
    const allPlayed = this.entry.picks.every((pick: CompletedPick) => {
      const gameTime = pick.game_time ? new Date(pick.game_time) : null;
      return gameTime ? gameTime <= now : true;
    });
    
    return allPlayed;
  }

  public ngOnInit() {
    this.svc
      .getPlayoffPickForFlyout(this.context.entryId)
      .pipe(
        mergeMap((playoffResult) => {
          this.playoffPicks = playoffResult;
          return this.svc.getStandingsEntry(this.context.entryId);
        })
      )
      .subscribe((result: any) => {
        this.entry = result;
        this.name = this.entry.entry_name!;
        
        // For admins, show all picks. For regular users, only show played games
        if (this.isAdmin) {
          this.picks = this.entry.picks || [];
        } else {
          // Filter picks to only show those that have already happened
          const now = new Date();
          this.picks = this.entry.picks!.filter((pick: CompletedPick) => {
            const gameTime = pick.game_time ? new Date(pick.game_time) : null;
            return gameTime ? gameTime <= now : true; // Show picks with no game_time as fallback
          });
        }
        
        this.picks.forEach((pick: CompletedPick) => {
          // Set correct1 and correct2 based on whether the picked team won
          if (pick.team_1_won || pick.team_2_won) {
            pick.correct1 = pick.team_1 ? (pick.team_1_won ? true : false) : undefined;
            pick.correct2 = pick.team_2 ? (pick.team_2_won ? true : false) : undefined;
          }
          if (pick.earned_points) {
            this.points += pick.earned_points;
          }
        });
        
        // Check if all bowl games have been played
        this.allBowlGamesPlayed = this.checkIfAllBowlGamesPlayed();
      });
  }
}
