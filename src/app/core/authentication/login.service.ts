import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { Menu } from '@core';
import { Token, User } from './interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // Ejemplo: 'https://localhost:7027/api'

  login(username: string, password: string, rememberMe = false) {
    return this.http.post<Token>(`${this.apiUrl}/auth/login`, { username, password, rememberMe });
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
    // return this.http.get<{ menu: Menu[] }>(`${this.apiUrl}/menu`).pipe(map(res => res.menu));
    return this.http.get<Menu[]>(`${this.apiUrl}/menu`);
  }
}
