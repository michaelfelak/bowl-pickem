import { Injectable } from '@angular/core';
import { PickModel } from './bowl.model';

export interface ValidationResult {
  isValid: boolean;
  threePointError: boolean;
  fivePointError: boolean;
  tenPointError: boolean;
  threePointGames: number;
  fivePointGames: number;
  tenPointGames: number;
}

@Injectable({
  providedIn: 'root'
})
export class PicksValidationService {
  // Business rules for bonus points
  private readonly maxThreePointGames = 5;
  private readonly maxFivePointGames = 5;
  private readonly maxTenPointGames = 1;

  constructor() { }

  /**
   * Validate bonus points for a list of picks
   * Returns validation result with error flags and counts
   */
  public validateBonusPoints(picks: PickModel[]): ValidationResult {
    const threePointGames = picks.filter(pick => pick.points === 3).length;
    const fivePointGames = picks.filter(pick => pick.points === 5).length;
    const tenPointGames = picks.filter(pick => pick.points === 10).length;

    const threePointError = threePointGames > this.maxThreePointGames;
    const fivePointError = fivePointGames > this.maxFivePointGames;
    const tenPointError = tenPointGames > this.maxTenPointGames;

    return {
      isValid: !threePointError && !fivePointError && !tenPointError,
      threePointError,
      fivePointError,
      tenPointError,
      threePointGames,
      fivePointGames,
      tenPointGames
    };
  }

  /**
   * Get error message for bonus points validation
   */
  public getBonusPointsErrorMessage(result: ValidationResult): string | null {
    if (result.threePointError) {
      return `You have too many 3 point games selected (${result.threePointGames}/${this.maxThreePointGames}).`;
    }
    if (result.fivePointError) {
      return `You have too many 5 point games selected (${result.fivePointGames}/${this.maxFivePointGames}).`;
    }
    if (result.tenPointError) {
      return `You have too many 10 point games selected (${result.tenPointGames}/${this.maxTenPointGames}).`;
    }
    return null;
  }

  /**
   * Get max allowed games for a point value
   */
  public getMaxForPoints(points: number): number {
    switch (points) {
      case 3:
        return this.maxThreePointGames;
      case 5:
        return this.maxFivePointGames;
      case 10:
        return this.maxTenPointGames;
      default:
        return Infinity;
    }
  }

  /**
   * Get available point values based on current picks
   * Returns an array of allowed point values to prevent exceeding limits
   */
  public getAvailablePointValues(picks: PickModel[], allPointValues: number[]): Record<number, boolean> {
    const validation = this.validateBonusPoints(picks);
    
    return {
      1: true, // Always allow 1 point
      3: validation.threePointGames < this.maxThreePointGames,
      5: validation.fivePointGames < this.maxFivePointGames,
      10: validation.tenPointGames < this.maxTenPointGames
    };
  }
}
