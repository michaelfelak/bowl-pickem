import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PointBreakdownData {
  team1Name: string;
  team2Name: string;
  pointDistributionByTeam: { [points: number]: { team1: number; team2: number } };
}

@Component({
  standalone: true,
  selector: 'app-point-breakdown-chart',
  imports: [CommonModule],
  templateUrl: './point-breakdown-chart.component.html',
  styleUrls: ['./point-breakdown-chart.component.scss']
})
export class PointBreakdownChartComponent {
  @Input() data: PointBreakdownData | null = null;
  @Input() legendPosition: 'below' | 'right' = 'below';

  private colorPalette = [
    '#d32f2f', '#1976d2', '#f57c00', '#c2185b', // Red, Blue, Orange, Pink
    '#0097a7', '#388e3c', '#7b1fa2', '#5d4037', // Cyan, Green, Purple, Brown
    '#e64a19', '#0288d1', '#d84315', '#6a1b9a'  // Deep Orange, Light Blue, Deep Orange, Deep Purple
  ];

  public getPointBreakdownGradient(): string {
    if (!this.data) {
      return 'conic-gradient(#cccccc 0deg 360deg)';
    }

    const segments = this.buildPointBreakdownSegments();

    if (segments.length === 0) {
      return 'conic-gradient(#cccccc 0deg 360deg)';
    }

    const total = segments.reduce((sum, s) => sum + s.count, 0);
    let gradient = 'conic-gradient(';
    let currentDegree = 0;

    segments.forEach((segment, idx) => {
      const percentage = (segment.count / total) * 100;
      const degrees = (percentage / 100) * 360;
      gradient += `${segment.color} ${currentDegree}deg ${currentDegree + degrees}deg`;
      if (idx < segments.length - 1) {
        gradient += ', ';
      }
      currentDegree += degrees;
    });

    gradient += ')';
    return gradient;
  }

  public getPointBreakdownLegend(): Array<{ points: number; team: number; teamName: string; count: number; color: string }> {
    const segments = this.buildPointBreakdownSegments();
    return segments.map(seg => ({
      points: seg.points,
      team: seg.team,
      teamName: seg.teamName,
      count: seg.count,
      color: seg.color
    }));
  }

  private buildPointBreakdownSegments(): Array<{ points: number; team: number; teamName: string; count: number; color: string }> {
    if (!this.data) {
      return [];
    }

    const result: Array<{ points: number; team: number; teamName: string; count: number; color: string }> = [];
    let colorIndex = 0;

    [1, 3, 5, 10].forEach((points) => {
      if (this.data!.pointDistributionByTeam[points]) {
        const team1Count = this.data!.pointDistributionByTeam[points].team1;
        const team2Count = this.data!.pointDistributionByTeam[points].team2;
        if (team1Count > 0) {
          result.push({
            points,
            team: 1,
            teamName: this.data!.team1Name,
            count: team1Count,
            color: this.colorPalette[colorIndex % this.colorPalette.length]
          });
          colorIndex++;
        }
        if (team2Count > 0) {
          result.push({
            points,
            team: 2,
            teamName: this.data!.team2Name,
            count: team2Count,
            color: this.colorPalette[colorIndex % this.colorPalette.length]
          });
          colorIndex++;
        }
      }
    });

    return result;
  }
}
