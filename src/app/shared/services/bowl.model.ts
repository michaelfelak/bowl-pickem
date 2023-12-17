// tslint:disable variable-name
export class PickRequest {
  public picks!: PickModel[];
}

export class PickModel {
  public id!: string;
  public entry_id!: string;
  public game_id!: string;
  public points!: number;
  public team_1!: boolean;
  public team_2!: boolean;
  public team_1_name!: string;
  public team_2_name!: string;
  public score_1!: number;
  public score_2!: number;
  public game_time!: string;
  public bowl_name!: string;
  public is_playoff!: boolean;
  public is_championship!: boolean;
  public picked_school_id!: string;
  public is_new_years_game!: boolean;
}

export class PickResponse {
  public name!: string;
  public picks!: PickModel[];
}

export class School {
  public ID!: string;
  public Name!: string;
}

export class Game {
  public ID!: string;
  public School1ID!: string;
  public School2ID!: string;
  public BowlID: string = '';
  public GameTime!: Date;
  public Year!: number;
  public IsPlayoff!: boolean;
  public IsChampionship!: boolean;
}

export class Bowl {
  public id: string = '';
  public name!: string;
  public city!: string;
  public state!: string;
  public stadium_name!: string;
}

export class PersonRequest {
  public Name!: string;
  public Email!: string;
}

export class EntryRequest {
  public Name: string = '';
  public Email: string = '';
  public Tiebreaker1: number = 0;
  public Tiebreaker2: number = 0;
  public IsTesting: boolean = false;
  public Year!: number;
}

export class PersonResponse {
  public id!: string;
  public name!: string;
}

export class Entry {
  public id!: string;
  public name!: string;
  public email!: string;
  public paid!: boolean;
  public created_date!: string;
}

export class GameResultModel {
  public id!: string;
  public bowl_name!: string;
  public game_time!: Date;
  public game_id!: string;
  public team_1_name!: string;
  public team_2_name!: string;
  public score_1!: number;
  public score_2!: number;
  public winning_school_id!: string;
  public losing_school_id!: string;
}

export class StandingsEntry {
  public rank!: number;
  public entry_id!: number;
  public entry_name!: string;
  public correct_picks!: number;
  public current_points!: number;
  public remaining_points!: number;
  public possible_points!: number;
  public is_paid!: boolean;
}

export class CompletedEntry {
  public entry_name!: string;
  public picks!: CompletedPick[];
}

export class CompletedPick {
  public bowl_name!: string;
  public team_1!: boolean;
  public team_1_won!: boolean;
  public team_1_name!: string;
  public team_2!: boolean;
  public team_2_won!: boolean;
  public team_2_name!: string;
  public points!: number;
  public earned_points!: number;
  public correct!: boolean;
  public not_played!: boolean;
}

export class AnalysisRecord {
  public selected!: number;
  public school_1_name!: string;
  public school_2_name!: string;
  public bowl_id!: number;
  public game_id!: number;
  public bowl_name!: string;
}

export class AnalysisModel {
  public Selected1!: number;
  public Selected2!: number;
  public School1Name!: string;
  public School2Name!: string;
  public BowlName!: string;
}

export class TodaysGame {
  public game_id!: number;
  public bowl_name!: string;
  public game_time!: string;
  public school_1_name!: string;
  public school_2_name!: string;
}

export class BlogEntry {
  public Id!: string;
  public Title!: string;
  public Body!: string;
  public CreatedDate!: string;
  public PostedBy!: string;
}

export class BowlPick {
  public game_id!: number;
  public name!: string;
  public team_1_picked!: boolean;
  public team_2_picked!: boolean;
  public points!: number;
  public totalPoints!: number;
  public team_1_won?: boolean;
  public team_2_won?: boolean;
  public earned_points: number = 0;
}
