import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface InvoiceDetail {
  invoiceDetailId?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  clientName: string;
  dueDate: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  details?: InvoiceDetail[];
}
@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly api = `${environment.apiUrl}/invoices`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.api);
  }

  saveInvoice(invoice: Invoice): Observable<void> {
    return this.http.post<void>(this.api, invoice);
  }

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.api);
  }
  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/${id}`);
  }
}
