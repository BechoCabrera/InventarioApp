import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CashClosing {
  cashClosingId: string;
  totalCash: number;
  totalCredit: number;
  totalCard: number;
  totalTransfer: number;
  totalAmount: number;
  changeAmount: number;
  entitiId: string;
  createdAt: string;
  createdBy: string;
}

@Injectable({
  providedIn: 'root',
})
export class CashClosingService {
  private readonly api = `${environment.apiUrl}/cashclosing`; // Endpoint de API para el cierre de caja

  constructor(private http: HttpClient) {}

  // Obtener todos los cierres de caja
  getAllCashClosings(entitiId: string): Observable<CashClosing[]> {
    return this.http.get<CashClosing[]>(`${this.api}?entitiId=${entitiId}`);
  }

  // Crear un nuevo cierre de caja
  saveCashClosing(cashClosing: any): Observable<CashClosing> {
    return this.http.post<CashClosing>(this.api, cashClosing);
  }

  // Obtener un cierre de caja específico por ID
  getCashClosingById(id: string, entitiId: string): Observable<CashClosing> {
    return this.http.get<CashClosing>(`${this.api}/${id}?entitiId=${entitiId}`);
  }

  // Eliminar un cierre de caja por ID
  deleteCashClosing(id: string, entitiId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}?entitiId=${entitiId}`);
  }

  // Obtener el cierre de caja del día
  getCashClosingByDate(date: string, entitiId: string): Observable<CashClosing[]> {
    const formattedDate = new Date(date).toISOString().split('T')[0]; // Convertir la fecha a formato YYYY-MM-DD
    const url = `${this.api}/byDate?date=${formattedDate}&entitiId=${entitiId}`;
    return this.http.get<CashClosing[]>(url);
  }
}
