import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Client {
  clientId?: string;
  name: string;
  nit: string;
  email: string;
  phone: string;
  entitiName: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl = `${environment.apiUrl}/clients`; // ← CORREGIDO
  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  create(client: Client): Observable<any> {
    return this.http.post(this.apiUrl, client);
  }
}
