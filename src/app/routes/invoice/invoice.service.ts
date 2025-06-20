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
  amountPaid: number;
  status: string;
  entitiName: string;
  paymentMethod?: string;
  nameClientDraft?: string;
  nitClientDraft?: string;
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

  saveInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.api, invoice);
  }

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.api);
  }
  getById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/${id}`);
  }

  getInvoicesByDate(date: string): Observable<Invoice[]> {
    // Asegúrate de que 'date' esté en formato ISO, y si no, conviértelo
    const formattedDate = new Date(date).toISOString().split('T')[0]; // Convierte la fecha a formato YYYY-MM-DD
    const url = `${this.api}/byDate?date=${formattedDate}`; // Utilizamos el formato correcto para la fecha
    return this.http.get<Invoice[]>(url); // Realizamos la llamada HTTP
  }

}
