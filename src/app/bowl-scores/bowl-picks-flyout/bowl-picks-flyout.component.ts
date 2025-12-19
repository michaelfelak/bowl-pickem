import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { AuthService } from '../../shared/services/auth.service';
import {
  Bowl,
  BowlPick,
  Game,
  GameResultModel,
  School,
  StandingsEntry,
} from '../../shared/services/bowl.model';
import { BowlPicksFlyoutContext } from './bowl-picks-flyout.context';
import { mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { StatusIndicatorComponent } from '../../shared/status-indicator/status-indicator.component';
import { SchoolLogoComponent } from '../../shared/school-logo/school-logo.component';
import { PointBreakdownChartComponent } from '../../shared/point-breakdown-chart/point-breakdown-chart.component';

@Component({
  standalone: true,
  selector: 'app-bowl-picks-flyout',
  imports: [CommonModule, StatusIndicatorComponent, SchoolLogoComponent, PointBreakdownChartComponent],
  providers: [SettingsService],
  templateUrl: './bowl-picks-flyout.component.html',
  styleUrls: ['./bowl-picks-flyout.component.scss'],
})
export class BowlPicksFlyoutComponent implements OnInit {
  public picks: BowlPick[] = [];
  public name = '';
  public points = 0;
  public standings: StandingsEntry[] = [];
  public bowlList: Bowl[] = [];
  public gameList: Game[] = [];
  public bowlName = '';
  public gameTime: Date = new Date();
  public team1name = '';
  public team2name = '';
  public team1logo_id = '';
  public team2logo_id = '';
  public team1score = 0;
  public team2score = 0;
  public schoolList: School[] = [];
  public gameResults: GameResultModel[] = [];
  public gameHasResult = false;
  public isAdmin = false;

  public team1picks = 0;
  public team2picks = 0;
  public onePointCount = 0;
  public threePointCount = 0;
  public fivePointCount = 0;
  public team1PickPercentage = 0;
  public team2PickPercentage = 0;
  public team1Color = '#014d0e';
  public team2Color = '#ff9800';
  public pointDistributionByTeam: { [points: number]: { team1: number; team2: number } } = {};
  private currentYear: number = 0;

  constructor(
    public context: BowlPicksFlyoutContext,
    private svc: BowlService,
    private authService: AuthService,
    private settings: SettingsService
  ) {
  }

  public ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.settings.settings$
      .pipe(
        mergeMap((settings) => {
          this.currentYear = settings.current_year;
          return this.svc.getStandings(this.currentYear);
        }),
        mergeMap((standings: any) => {
          this.standings = standings;
          return this.svc.getBowlList();
        }),
        mergeMap((bowlList: any) => {
          this.bowlList = bowlList;
          return this.svc.getGameResults(this.currentYear);
        }),
        mergeMap((gameResults: GameResultModel[]) => {
          this.gameResults = gameResults;
          return this.svc.getSchools();
        }),
        mergeMap((schoolList: any) => {
          this.schoolList = schoolList;
          return this.svc.getGames(this.currentYear);
        }),
        mergeMap((games: Game[]) => {
          this.gameList = games;
          const game = this.getGameById(this.context.gameId);
          this.team1name = this.getSchoolById(game.School1ID!);
          this.team1logo_id = this.getSchoolLogoById(game.School1ID!);
          this.team2name = this.getSchoolById(game.School2ID!);
          this.team2logo_id = this.getSchoolLogoById(game.School2ID!);
          this.gameTime = game.GameTime!;
          this.setBowlName(game.BowlID!);
          return this.svc.getBowlPicks(this.context.gameId);
        })
      )
      .subscribe((result: BowlPick[]) => {
        this.picks = result;

        this.sortPicks();
        this.assignGameResults();
        this.calculateTotalPicks();
        this.loadDominantColors();
      });
  }

  private calculateTotalPicks() {
    this.team1picks = this.picks.filter((pick) => {
      return pick.team_1_picked === true;
    }).length;

    this.team2picks = this.picks.filter((pick) => {
      return pick.team_2_picked === true;
    }).length;

    // Calculate point distribution
    this.onePointCount = this.picks.filter((pick) => pick.points === 1).length;
    this.threePointCount = this.picks.filter((pick) => pick.points === 3).length;
    this.fivePointCount = this.picks.filter((pick) => pick.points === 5).length;

    // Calculate point distribution by team
    this.pointDistributionByTeam = {
      1: { team1: 0, team2: 0 },
      3: { team1: 0, team2: 0 },
      5: { team1: 0, team2: 0 },
      10: { team1: 0, team2: 0 }
    };

    this.picks.forEach((pick) => {
      const points = pick.points as keyof typeof this.pointDistributionByTeam;
      if (this.pointDistributionByTeam[points]) {
        if (pick.team_1_picked) {
          this.pointDistributionByTeam[points].team1++;
        }
        if (pick.team_2_picked) {
          this.pointDistributionByTeam[points].team2++;
        }
      }
    });

    // Calculate percentages
    const totalPicks = this.team1picks + this.team2picks;
    if (totalPicks > 0) {
      this.team1PickPercentage = Math.round((this.team1picks / totalPicks) * 100);
      this.team2PickPercentage = Math.round((this.team2picks / totalPicks) * 100);
    }
  }

  private getSchoolById(schoolId: string): string {
    const school = this.schoolList.find((school) => {
      return school.id?.toString() === schoolId.toString();
    });
    if (school) {
      return school.name!;
    }
    return '';
  }

  private getSchoolLogoById(schoolId: string): string {
    const school = this.schoolList.find((school) => {
      return school.id === schoolId;
    });
    if (school && school.logo_id) {
      return school.logo_id;
    }
    return '';
  }

  private getGameById(gameId: string): Game {
    const game = this.gameList.find((game) => {
      return game.ID === gameId;
    });
    if (game) {
      return game;
    }
    return {} as Game;
  }

  private sortPicks() {
    this.picks.forEach((pick) => {
      const pickEntry = this.standings.find((entry) => {
        return entry.entry_name === pick.name;
      });
      if (pickEntry) {
        pick.totalPoints = pickEntry.current_points;
      }
    });
    
    this.picks.sort((a: BowlPick, b: BowlPick) => {
      return a.totalPoints! > b.totalPoints! ? -1 : 1;
    });
  }

  private setBowlName(bowlId: string) {
    const bowl = this.bowlList.find((result) => {
      return result.id === bowlId;
    });

    if (bowl) {
      this.bowlName = bowl.name!;
    }
  }

  private assignGameResults() {
    this.picks.forEach((pick) => {
      const result = this.gameResults.find((gameResult) => {
        return pick.game_id!.toString() === gameResult.game_id!.toString();
      });
      if (result && result.score_1 !== result.score_2) {
        pick.team_1_won = result.score_1! > result.score_2!;
        pick.team_2_won = result.score_1! < result.score_2!;
        this.gameHasResult = true;
        this.team1score = result.score_1!;
        this.team2score = result.score_2!;
        if (pick.team_1_picked !== undefined && pick.team_1_won !== undefined) {
          pick.correct1 =
            pick.team_1_picked === true && pick.team_1_won === true;
        }
        if (pick.team_2_picked !== undefined && pick.team_2_won !== undefined) {
          pick.correct2 =
            pick.team_2_picked === true && pick.team_2_won === true;
        }

        if (
          (pick.team_1_won && !pick.team_1_picked) ||
          (pick.team_2_won && !pick.team_2_picked)
        ) {
          pick.earned_points = pick.points! * -1;
        } else {
          pick.earned_points = pick.points;
        }
      } else {
        this.gameHasResult = false;
      }
    });
  }

  private extractDominantColor(logoId: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `assets/logos/${logoId}.png`;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('#014d0e');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const colorMap: { [key: string]: number } = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent or near-white pixels
          if (a < 128 || (r > 240 && g > 240 && b > 240)) {
            continue;
          }

          const hex = '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('').toUpperCase();

          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        const dominantColor = Object.keys(colorMap).reduce((a, b) =>
          colorMap[a] > colorMap[b] ? a : b
        );

        resolve(dominantColor || '#014d0e');
      };

      img.onerror = () => {
        resolve('#014d0e');
      };
    });
  }

  private async loadDominantColors(): Promise<void> {
    if (this.team1logo_id) {
      this.team1Color = await this.extractDominantColor(this.team1logo_id);
    }
    if (this.team2logo_id) {
      this.team2Color = await this.extractDominantColor(this.team2logo_id);
    }

    // If colors are too similar, use white for team 2
    if (this.areColorsSimilar(this.team1Color, this.team2Color)) {
      this.team2Color = '#FFFFFF';
    }
  }

  private areColorsSimilar(color1: string, color2: string): boolean {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    // Calculate color distance using Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    // If distance is less than 100, consider them similar
    return distance < 100;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}

