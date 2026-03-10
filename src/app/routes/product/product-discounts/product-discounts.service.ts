import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PromotionCreateDto, PromotionCalculationRequest, PromotionCalculationResponse } from '../../invoice/create-invoice/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProductDiscountsService {
  private readonly api = `${environment.apiUrl}/promotions`; // ← CORREGIDO
  constructor(private http: HttpClient) {}

  calculatePromotion(details: PromotionCalculationRequest[]): Observable<PromotionCalculationResponse[]> {
    return this.http.post<PromotionCalculationResponse[]>(`${this.api}/calculate`, details);
  }

  createPromotion(dto: PromotionCreateDto): Observable<any> {
    return this.http.post(this.api, dto);
  }

  getPromotions(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  getPromotionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  updatePromotion(id: string, dto: PromotionCreateDto): Observable<any> {
    return this.http.put(`${this.api}/${id}`, dto);
  }

  deletePromotion(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

    /** Cambia el estado de la promoción (toggle) */
    togglePromotionStatus(id: string): Observable<any> {
      return this.http.put(`${this.api}/${id}/toggle`, {});
    }
}
