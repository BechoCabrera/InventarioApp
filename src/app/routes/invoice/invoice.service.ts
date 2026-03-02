import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { InvoiceCreateDto, InvoiceDto } from './create-invoice/models';
@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly api = `${environment.apiUrl}/invoices`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(this.api);
  }

  saveInvoice(invoice: InvoiceCreateDto): Observable<InvoiceDto> {
    return this.http.post<InvoiceDto>(this.api, invoice);
  }

  getAllInvoices(): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(this.api);
  }
  getById(id: string): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.api}/${id}`);
  }

  getInvoicesByDate(date: string): Observable<InvoiceDto[]> {
    // Asegúrate de que 'date' esté en formato ISO, y si no, conviértelo
    const formattedDate = new Date(date).toISOString().split('T')[0]; // Convierte la fecha a formato YYYY-MM-DD
    const url = `${this.api}/byDate?date=${formattedDate}`; // Utilizamos el formato correcto para la fecha
    return this.http.get<InvoiceDto[]>(url); // Realizamos la llamada HTTP
  }
  // Método para buscar facturas por número
  searchInvoiceByNumber(invoiceNumber: string): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`${this.api}/search?number=${invoiceNumber}`);
  }

  getInvoicesByFilter(filters: any): Observable<InvoiceDto[]> {
    console.log('🔍 Enviando filtros:', filters);
    return this.http.post<InvoiceDto[]>(`${this.api}/filter`, filters);
  }
}
