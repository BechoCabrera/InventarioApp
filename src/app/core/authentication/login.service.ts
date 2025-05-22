import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, tap, throwError } from 'rxjs';

import { Menu } from '@core';
import { Token, User } from './interface';
import { environment } from '@env/environment';
import { Console } from 'console';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  headers: HttpHeaders = new HttpHeaders();

  private readonly apiUrl = environment.apiUrl; // Ejemplo: 'https://localhost:7027/api'
  constructor(private http: HttpClient) {}
  login(username: string, password: string, rememberMe = false) {
    // return this.http.post<Token>(`${this.apiUrl}/auth/login`, { username, password, rememberMe });
    return this.http
      .post<Token>(`${this.apiUrl}/auth/login`, { username, password, rememberMe })
      .pipe(
        tap((response: Token) => {
          localStorage.setItem('authToken', response.accessToken); // Guardamos el token
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
    return this.http.post<Menu[]>(`${this.apiUrl}/menu`, {}).pipe(
      tap(menu => console.log('✅ Menú recibido:', menu)),
      catchError(error => {
        console.error('❌ Error al obtener el menú:', error);
        return throwError(() => new Error('No se pudo obtener el menú'));
      })
    );
  }
}
