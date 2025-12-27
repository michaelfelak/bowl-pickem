import { Component, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';
import { SettingsService } from '../shared/services/settings.service';
import { AuthService } from '../shared/services/auth.service';
import { Game, GameResultModel } from '../shared/services/bowl.model';
import { CommonModule } from '@angular/common';
import { mergeMap } from 'rxjs/operators';
import { PointBreakdownChartComponent } from '../shared/point-breakdown-chart/point-breakdown-chart.component';

interface GameBreakdown {
  gameId: string;
  bowlName: string;
  team1Name: string;
  team2Name: string;
  team1LogoId: string;
  team2LogoId: string;
  team1Picks: number;
  team2Picks: number;
  team1PickPercentage: number;
  team2PickPercentage: number;
  onePointCount: number;
  threePointCount: number;
  fivePointCount: number;
  tenPointCount: number;
  onePointPercentage: number;
  threePointPercentage: number;
  fivePointPercentage: number;
  tenPointPercentage: number;
  pointsGradient: string;
  pointDistributionByTeam: { [points: number]: { team1: number; team2: number } };
  team1Color: string;
  team2Color: string;
  score1: number;
  score2: number;
  isCompleted: boolean;
}

@Component({
  standalone: true,
  selector: 'app-pick-breakdowns',
  imports: [CommonModule, PointBreakdownChartComponent],
  templateUrl: './pick-breakdowns.component.html',
  styleUrls: ['./pick-breakdowns.component.scss']
})
export class PickBreakdownsComponent implements OnInit {
  public gameBreakdowns: GameBreakdown[] = [];
  public failedLogos: Set<string> = new Set();
  public isAdmin: boolean = false;
  private currentYear: number = 0;

  constructor(
    private svc: BowlService,
    private settings: SettingsService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  public ngOnInit() {
    this.settings.settings$
      .pipe(
        mergeMap((settings) => {
          this.currentYear = settings.current_year;
          return this.svc.getGameResults(this.currentYear);
        }),
        mergeMap((gameResults: GameResultModel[]) => {
          // Filter to only completed games
          const completedGames = gameResults.filter((game) => {
            return game.score_1! + game.score_2! > 0;
          });
          return this.svc.getGames(this.currentYear);
        })
      )
      .subscribe(() => {
        this.loadGameBreakdowns();
      });
  }

  private loadGameBreakdowns() {
    const isAdmin = this.authService.isAdmin();
    
    this.svc.getGameResults(this.currentYear).pipe(
      mergeMap((gameResults: GameResultModel[]) => {
        // Filter based on admin status and game start time
        let gamesToProcess = isAdmin 
          ? gameResults  // Show all games for admins
          : gameResults.filter((game) => this.hasGameStarted(game));  // Show only started games for non-admins
        
        // For each game, we need to get bowl picks
        const breakdownPromises = gamesToProcess.map((game) => {
          return this.svc.getBowlPicks(game.game_id!).toPromise().then((picks) => {
            return this.createGameBreakdown(game, picks || []);
          });
        });

        return Promise.all(breakdownPromises);
      })
    ).subscribe((breakdowns: GameBreakdown[]) => {
      this.gameBreakdowns = breakdowns;
    });
  }

  private hasGameStarted(game: GameResultModel): boolean {
    if (!game.game_time) {
      return false;
    }
    // Game has started if the game time is in the past
    const gameTime = new Date(game.game_time);
    return gameTime < new Date();
  }

  private async createGameBreakdown(game: GameResultModel, picks: any[]): Promise<GameBreakdown> {
    const team1Picks = picks.filter((p) => p.team_1_picked === true).length;
    const team2Picks = picks.filter((p) => p.team_2_picked === true).length;
    const totalPicks = team1Picks + team2Picks;

    const onePointCount = picks.filter((p) => p.points === 1).length;
    const threePointCount = picks.filter((p) => p.points === 3).length;
    const fivePointCount = picks.filter((p) => p.points === 5).length;
    const tenPointCount = picks.filter((p) => p.points === 10).length;
    const totalPoints = onePointCount + threePointCount + fivePointCount + tenPointCount;

    const onePointPercentage = totalPoints > 0 ? (onePointCount / totalPoints) * 100 : 0;
    const threePointPercentage = totalPoints > 0 ? (threePointCount / totalPoints) * 100 : 0;
    const fivePointPercentage = totalPoints > 0 ? (fivePointCount / totalPoints) * 100 : 0;
    const tenPointPercentage = totalPoints > 0 ? (tenPointCount / totalPoints) * 100 : 0;

    const pointsGradient = this.generatePointsGradient(onePointPercentage, threePointPercentage, fivePointPercentage, tenPointPercentage);

    const isCompleted = game.score_1! + game.score_2! > 0;

    // Calculate point distribution by team
    const pointDistributionByTeam: { [points: number]: { team1: number; team2: number } } = {};
    [1, 3, 5, 10].forEach(points => {
      const team1Count = picks.filter((p) => p.team_1_picked === true && p.points === points).length;
      const team2Count = picks.filter((p) => p.team_2_picked === true && p.points === points).length;
      if (team1Count > 0 || team2Count > 0) {
        pointDistributionByTeam[points] = { team1: team1Count, team2: team2Count };
      }
    });

    // Extract dominant colors from logos
    let team1Color = await this.extractDominantColor(game.team_1_logo_id!);
    let team2Color = await this.extractDominantColor(game.team_2_logo_id!);
    
    // Check if colors are too similar and adjust if needed
    if (this.areColorsSimilar(team1Color, team2Color)) {
      team2Color = '#ffffff';
    }

    return {
      gameId: game.game_id!,
      bowlName: game.bowl_name!,
      team1Name: game.team_1_name!,
      team2Name: game.team_2_name!,
      team1LogoId: game.team_1_logo_id!,
      team2LogoId: game.team_2_logo_id!,
      team1Picks: team1Picks,
      team2Picks: team2Picks,
      team1PickPercentage: totalPicks > 0 ? Math.round((team1Picks / totalPicks) * 100) : 0,
      team2PickPercentage: totalPicks > 0 ? Math.round((team2Picks / totalPicks) * 100) : 0,
      onePointCount: onePointCount,
      threePointCount: threePointCount,
      fivePointCount: fivePointCount,
      tenPointCount: tenPointCount,
      onePointPercentage: Math.round(onePointPercentage),
      threePointPercentage: Math.round(threePointPercentage),
      fivePointPercentage: Math.round(fivePointPercentage),
      tenPointPercentage: Math.round(tenPointPercentage),
      pointsGradient: pointsGradient,
      pointDistributionByTeam: pointDistributionByTeam,
      team1Color: team1Color,
      team2Color: team2Color,
      score1: game.score_1!,
      score2: game.score_2!,
      isCompleted: isCompleted
    };
  }

  private generatePointsGradient(onePercent: number, threePercent: number, fivePercent: number, tenPercent: number): string {
    const colors = [
      { percent: onePercent, color: '#1976d2', label: '1 Point' },
      { percent: threePercent, color: '#f57c00', label: '3 Points' },
      { percent: fivePercent, color: '#388e3c', label: '5 Points' },
      { percent: tenPercent, color: '#c62828', label: '10 Points' }
    ];

    // Filter out zero percentages
    const activeColors = colors.filter(c => c.percent > 0);

    if (activeColors.length === 0) {
      return 'conic-gradient(#cccccc 0deg 360deg)';
    }

    let gradient = 'conic-gradient(';
    let currentDegree = 0;

    activeColors.forEach((c, index) => {
      const nextDegree = currentDegree + (c.percent / 100) * 360;
      gradient += `${c.color} ${currentDegree}deg ${nextDegree}deg`;
      if (index < activeColors.length - 1) {
        gradient += ', ';
      }
      currentDegree = nextDegree;
    });

    gradient += ')';
    return gradient;
  }

  private areColorsSimilar(color1: string, color2: string): boolean {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    return distance < 100;
  }

  private extractDominantColor(logoId: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
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
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 128) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          const hex = '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
          resolve(hex);
        } else {
          resolve('#014d0e');
        }
      };
      img.onerror = () => {
        resolve('#014d0e');
      };
      img.src = `assets/logos/${logoId}.png`;
    });
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

  public onLogoError(logoId: string): void {
    this.failedLogos.add(logoId);
  }

  public canShowLogo(logoId: string): boolean {
    return !this.failedLogos.has(logoId);
  }

  public getFinalScoreText(game: GameBreakdown): string {
    if (!game.isCompleted) {
      return '';
    }
    const winnerTeam = game.score1 > game.score2 ? game.team1Name : game.team2Name;
    const winnerScore = Math.max(game.score1, game.score2);
    const loserTeam = game.score1 > game.score2 ? game.team2Name : game.team1Name;
    const loserScore = Math.min(game.score1, game.score2);
    
    return `${winnerTeam}: ${winnerScore}, ${loserTeam}: ${loserScore}`;
  }

  public getPointDistributionData(game: GameBreakdown): Array<{ points: number; team1: number; team2: number }> {
    const result: Array<{ points: number; team1: number; team2: number }> = [];
    [1, 3, 5, 10].forEach(points => {
      if (game.pointDistributionByTeam[points]) {
        result.push({
          points,
          team1: game.pointDistributionByTeam[points].team1,
          team2: game.pointDistributionByTeam[points].team2
        });
      }
    });
    return result;
  }
}
