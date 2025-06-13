import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntitiConfigData } from './entiti-config.model';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class EntitiConfigService {
  private readonly apiUrl = `${environment.apiUrl}/entitiConfig`;

  constructor(private http: HttpClient) {}

  getByCode(code: string): Observable<EntitiConfigData> {
    return this.http.get<EntitiConfigData>(`${this.apiUrl}/${code}`);
  }

  create(payload: Omit<EntitiConfigData, 'id'>): Observable<EntitiConfigData> {
    return this.http.post<EntitiConfigData>(this.apiUrl, payload);
  }

  update(payload: EntitiConfigData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.apiUrl, payload);
  }

  getAll(): Observable<EntitiConfigData[]> {
    return this.http.get<EntitiConfigData[]>(`${this.apiUrl}`);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getMyEntiti(): Observable<{ data: EntitiConfigData }> {
    return this.http.get<{ data: EntitiConfigData }>(`${this.apiUrl}/myentiti`);
  }
}
