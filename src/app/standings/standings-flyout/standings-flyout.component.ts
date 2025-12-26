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
import { SchoolLogoComponent } from '../../shared/school-logo/school-logo.component';
import * as dayjs from 'dayjs';


@Component({
  standalone: true,
  selector: 'app-standings-flyout',
  imports: [CommonModule, StatusIndicatorComponent, SchoolLogoComponent],
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
  public isUserOwnEntry = false;
  public currentUserId: string | null = null;

  constructor(
    public context: StandingsFlyoutContext,
    private svc: BowlService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUserId();
  }

  public playoffPicks: PlayoffPickFlyout = {};

  public isGameInFuture(gameTime?: string): boolean {
    if (!gameTime) {
      return false; // Show picks without game_time
    }
    // Add 4 hours to current time to account for timezone offset
    const now = dayjs().add(1, 'hours');
    const gameDate = dayjs(gameTime);
    return gameDate.isAfter(now);
  }

  public checkIfAllBowlGamesPlayed(): boolean {
    if (!this.entry.picks || this.entry.picks.length === 0) {
      return false;
    }
    
    // Check if all picks have been played (no future games)
    const now = dayjs().add(1, 'hours');
    const allPlayed = this.entry.picks.every((pick: CompletedPick) => {
      const gameTime = pick.game_time ? dayjs(pick.game_time) : null;
      return gameTime ? gameTime.isBefore(now) || gameTime.isSame(now, 'minute') : true;
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
        
        // Check if entry is owned by the logged-in user
        if (this.currentUserId && this.context.entryUserId) {
          const userIdNum = parseInt(this.currentUserId, 10);
          this.isUserOwnEntry = this.context.entryUserId === userIdNum;
        }
        
        // For admins or entry owner, show all picks. For regular users, only show played games
        if (this.isAdmin || this.isUserOwnEntry) {
          this.picks = this.entry.picks || [];
        } else {
          // Filter picks to only show those that have already happened
          const now = dayjs().add(1, 'hours');
          this.picks = this.entry.picks!.filter((pick: CompletedPick) => {
            const gameTime = pick.game_time ? dayjs(pick.game_time) : null;
            return gameTime ? gameTime.isBefore(now) || gameTime.isSame(now, 'minute') : true; // Show picks with no game_time as fallback
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
