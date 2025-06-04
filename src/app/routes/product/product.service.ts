import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '@core';

export interface Product {
  productId?: string;
  name: string;
  description?: string;
  unitPrice: number;
  stock: number;
  categoryId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  barCode?: string;
  user: User;
  categoryName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`; // ← CORREGIDO
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: string, isActive: boolean): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, isActive);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // 🔍 Buscar por nombre (like)
  searchByName(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?name=${encodeURIComponent(name)}`);
  }

  // 🔍 Buscar por código de barras
  getByBarCode(barCode: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/barcode/${barCode}`);
  }
}
