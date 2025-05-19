import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  iif,
  map,
  merge,
  Observable,
  of,
  share,
  switchMap,
  tap,
} from 'rxjs';
import { filterObject, isEmptyObject } from './helpers';
import { Token, User } from './interface';
import { LoginService } from './login.service';
import { TokenService } from './token.service';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly loginService = inject(LoginService);
  private readonly tokenService = inject(TokenService);

  private user$ = new BehaviorSubject<User>({});

  private change$ = merge(
    this.tokenService.change(), // asumo que emite evento cuando cambia token
    this.tokenService.refresh().pipe(switchMap(() => this.refresh()))
  ).pipe(
    switchMap(() => this.assignUser()),
    share()
  );

  init() {
    return new Promise<void>(resolve => this.change$.subscribe(() => resolve()));
  }

  change() {
    return this.change$;
  }

  check(): boolean {
    return this.tokenService.valid();
  }

  login(username: string, password: string, rememberMe = false) {
    return this.loginService.login(username, password, rememberMe).pipe(
      tap(token => this.tokenService.set(token)),
      map(() => this.check())
    );
  }

  refresh() {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    return this.loginService.refresh(filterObject({ refresh_token: refreshToken })).pipe(
      catchError(() => of(undefined)),
      tap(token => {
        if (token) {
          this.tokenService.set(token);
        }
      }),
      map(() => this.check())
    );
  }

  logout() {
    return this.loginService.logout().pipe(
      tap(() => this.tokenService.clear()),
      map(() => !this.check())
    );
  }

  user(): Observable<User> {
    return this.user$.asObservable().pipe(share());
  }

  menu() {
    return iif(() => this.check(), this.loginService.menu(), of([]));
  }

  private assignUser(): Observable<User> {
    if (!this.check()) {
      this.user$.next({});
      return of({});
    }

    if (!isEmptyObject(this.user$.getValue())) {
      return of(this.user$.getValue());
    }

    return this.loginService.user().pipe(tap(user => this.user$.next(user)));
  }
}
