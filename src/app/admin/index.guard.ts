import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

@Injectable()
export class AdminRouteGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return of(this.authService.isAdmin());
  }
}

@Injectable()
export class PicksRouteGuard implements CanActivate {
  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    let id = route.queryParams['id'];

    if (id === '784920abf-e832-bddb-88ae-7ac89ea3ab21') {
      return of(true);
    }
    return of(false);
  }
}
