import { ActivatedRouteSnapshot, CanActivate } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable()
export class AdminRouteGuard implements CanActivate {
    public canActivate(
        route: ActivatedRouteSnapshot
    ): Observable<boolean> {
        let id = route.queryParams['id'];

        if (id === '89310bc3-d828-ae83-11bb-7bc89ea3ab21') {
            return of(true);
        }
        return of(false);
    }
}
