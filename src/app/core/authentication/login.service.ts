import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';

import { Menu, TokenService } from '@core';
import { Token, User } from './interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // Ejemplo: 'https://localhost:7027/api'
  private readonly tokenService = inject(TokenService);
  login(username: string, password: string, rememberMe = false) {
    return this.http
      .post<Token>(`${this.apiUrl}/auth/login`, { username, password, rememberMe })
      .pipe(
        tap((response: Token) => {
          this.tokenService.set(response);
        })
      );
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>(`${this.apiUrl}/auth/refresh`, params);
  }

  logout() {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {});
  }

  user() {
    return this.http.get<User>(`${this.apiUrl}/user`);
  }

  menu() {
    return this.http.get<Menu[]>(`${this.apiUrl}/menu`);
  }
}
