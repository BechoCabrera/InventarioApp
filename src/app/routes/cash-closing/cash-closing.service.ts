import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
@Injectable({
  providedIn: 'root',
})
export class CashClosingService {
   private readonly apiUrl = `${environment.apiUrl}/cashclosing`; // ← CORREGIDO

  constructor(private http: HttpClient) {}

  // Obtener todos los cierres de caja
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener un cierre de caja por ID
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo cierre de caja
  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
