// tslint?:disable variable-name
export interface PickRequest {
  entry_id?: string;
  picks?: PickModel[];
}

export interface PlayoffPickRequest {
  playoff_picks?: PlayoffPick[];
}

export interface PlayoffSchoolRequest {
  year: number;
  school_id: string;
  school_name: string;
  seed_number: number;
}

export interface PlayoffPick {
  entry_id: string;
  school1_id: number;
  school2_id: number;
  champion_school_id: number
  year: number;
}

export interface PlayoffPickFlyout{
  school_1?: string;
  school_1_logo_id?: string;
  school_1_correct?: boolean;
  school_2?: string;
  school_2_logo_id?: string;
  school_2_correct?: boolean;
  champion?: string;
  champion_logo_id?: string;
  champion_correct?: boolean;
}
export interface PlayoffResult {
  year: number;
  school1_id: number;
  school2_id: number;
  champion_school_id: number
}


export interface PickModel {
  id?: string;
  entry_id?: string;
  game_id?: string;
  points?: number;
  bonus_points?: number;
  team_1?: boolean;
  team_2?: boolean;
  team_1_picked?: boolean;
  team_2_picked?: boolean;
  team_1_name?: string;
  team_2_name?: string;
  team_1_logo_id?: string;
  team_2_logo_id?: string;
  score_1?: number;
  score_2?: number;
  game_time?: string;
  bowl_name?: string;
  is_playoff?: boolean;
  is_championship?: boolean;
  picked_school_id?: string;
  is_new_years_game?: boolean;
}

export interface PickResponse {
  name?: string;
  picks?: PickModel[];
}

export interface School {
  id?: string;
  name?: string;
  logo_id?: string;
}

export interface PlayoffSchool {
  id?: number;
  school_name: number;
  school_id: number;
  seed_number: number;
}

export interface Game {
  ID?: string;
  School1ID?: string;
  School2ID?: string;
  BowlID?: string;
  GameTime?: Date;
  Year?: number;
  IsPlayoff?: boolean;
  IsChampionship?: boolean;
}

export interface Bowl {
  id?: string;
  name?: string;
  city?: string;
  state?: string;
  stadium_name?: string;
}

export interface PersonRequest {
  Name?: string;
  Email?: string;
}

export interface EntryRequest {
  name?: string;
  email?: string;
  user_id?: string;
  tiebreaker_1?: number;
  tiebreaker_2?: number;
  testing?: boolean;
  year?: number;
}

export interface PersonResponse {
  id?: string;
  name?: string;
}

export interface Entry {
  id?: string;
  name?: string;
  entry_name?: string;
  email?: string;
  paid?: boolean;
  created_date?: string;
  timestamp?: string;
  tiebreaker_1?: number;
  tiebreaker_2?: number;
  picks?: PickModel[];
  year?: number;
}

export interface GameResultModel {
  id?: string;
  bowl_name?: string;
  game_time?: Date;
  game_id?: string;
  team_1_name?: string;
  team_2_name?: string;
  team_1_logo_id?: string;
  team_2_logo_id?: string;
  score_1?: number;
  score_2?: number;
  winning_school_id?: string;
  losing_school_id?: string;
}

export interface StandingsEntry {
  rank?: number;
  entry_id?: number;
  entry_name?: string;
  user_id?: number;
  correct_picks?: number;
  current_points?: number;
  remaining_points?: number;
  possible_points?: number;
  is_paid?: boolean;
}

export interface CompletedEntry {
  entry_name?: string;
  user_id?: number;
  picks?: CompletedPick[];
}

export interface CompletedPick {
  bowl_name?: string;
  game_time?: string;
  team_1?: boolean;
  team_1_won?: boolean;
  team_1_name?: string;
  school_1_logo_id?: string;
  team_2?: boolean;
  team_2_won?: boolean;
  team_2_name?: string;
  school_2_logo_id?: string;
  points?: number;
  earned_points?: number;
  correct1?: boolean;
  correct2?: boolean;
  not_played?: boolean;
}

export interface AnalysisRecord {
  selected?: number;
  school_1_name?: string;
  school_2_name?: string;
  bowl_id?: number;
  game_id?: number;
  bowl_name?: string;
}

export interface AnalysisModel {
  Selected1?: number;
  Selected2?: number;
  School1Name?: string;
  School2Name?: string;
  BowlName?: string;
}

export interface TodaysGame {
  game_id?: string;
  bowl_name?: string;
  game_time?: string;
  school_1_name?: string;
  school_2_name?: string;
}

export interface BlogEntry {
  id?: string;
  title?: string;
  body?: string;
  created_date?: string;
  posted_by?: string;
  year?: number;
}

export interface BowlPick {
  game_id?: number;
  name?: string;
  team_1_picked?: boolean;
  team_2_picked?: boolean;
  team_1_logo_id?: string;
  team_2_logo_id?: string;
  points?: number;
  totalPoints?: number;
  team_1_won?: boolean;
  team_2_won?: boolean;
  earned_points?: number;
  correct1?: boolean;
  correct2?: boolean;
}

export interface Tiebreaker {
  entry_name?: string;
  tiebreaker_1?: string; // bowl game
  tiebreaker_2?: string; // highest total
}

export interface Settings {
  current_year: number;
  submit_entry_enabled: boolean;
}
