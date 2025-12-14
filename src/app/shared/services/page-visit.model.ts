/**
 * Page Visit Models
 */

export interface PageVisit {
  id?: number;
  page?: string;
  action?: string;
  action_date?: Date;
  user_id?: number | null;
}

export interface PageVisitFilter {
  start_date?: Date;
  end_date?: Date;
  user_id?: number;
  page?: string;
  action?: string;
}

export interface PageVisitSummary {
  page?: string;
  action?: string;
  number_of_visits?: number;
  last_visit?: Date;
}

export interface UserPageVisitSummary {
  user_id?: number;
  total_visits?: number;
  first_visit?: Date;
  last_visit?: Date;
}
