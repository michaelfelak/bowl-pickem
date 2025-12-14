import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SettingsService } from './settings.service';
import { API_CONSTANTS } from '../constants/api.constants';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserResponse {
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly EMAIL_KEY = 'auth_email';
  private currentUserSubject: BehaviorSubject<string | null>;
  public currentUser$: Observable<string | null>;
  public jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    this.apiUrl = API_CONSTANTS.AUTH_API_URL;
    this.currentUserSubject = new BehaviorSubject<string | null>(this.getUsernameFromToken());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get the current username from the stored token
   */
  private getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.username || null;
    }
    return null;
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            // Store email if returned in response (backend update required)
            if ((response as any).email) {
              localStorage.setItem(this.EMAIL_KEY, (response as any).email);
            }
            this.currentUserSubject.next(username);
          }
        }),
        map(() => true),
        catchError(this.handleError)
      );
  }

  /**
   * Register a new user with username, email and password
   */
  register(username: string, email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.EMAIL_KEY, email);
            this.currentUserSubject.next(username);
          }
        }),
        map(() => true),
        catchError(this.handleError)
      );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Get the stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Get the current username
   */
  getCurrentUsername(): string | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Get the current user's email from JWT token or localStorage
   */
  getCurrentUserEmail(): string | null {
    // First, try to get email from JWT token (once backend is updated)
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      if (decoded?.email) {
        return decoded.email;
      }
    }
    // Fall back to localStorage (used during registration/login)
    return localStorage.getItem(this.EMAIL_KEY);
  }

  /**
   * Check if the current user is an admin (user ID 2 or 3)
   */
  isAdmin(): boolean {
    const userId = this.getCurrentUserId();
    const userIdStr = userId ? userId.toString() : '';
    return userIdStr === '2' || userIdStr === '3';
  }

  /**
   * Get the current user's ID from JWT token
   */
  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.id || null;
    }
    return null;
  }

  /**
   * Fetch user email from backend and cache it
   */
  fetchAndCacheUserEmail(): Observable<string> {
    const username = this.getCurrentUsername();
    if (!username) {
      return throwError(() => new Error('Not authenticated'));
    }
    
    // This endpoint should be created in the backend to return user info
    return this.http.get<UserResponse>(`${this.apiUrl}/user/${username}`)
      .pipe(
        tap(response => {
          if (response.email) {
            localStorage.setItem(this.EMAIL_KEY, response.email);
          }
        }),
        map(response => response.email),
        catchError(error => {
          // If backend endpoint doesn't exist yet, return cached email
          const cachedEmail = localStorage.getItem(this.EMAIL_KEY);
          if (cachedEmail) {
            return throwError(() => new Error('Backend endpoint not implemented, using cached email'));
          }
          return this.handleError(error);
        })
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
