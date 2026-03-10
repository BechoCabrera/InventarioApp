import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface User {
  userId?: string;
  username: string;
  entitiId: string | null;
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
}
