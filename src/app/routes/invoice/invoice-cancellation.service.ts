import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Invoice } from './invoice.service';

export interface InvoicesCancelledDto {
  invoiceCancelledId: string; // En TypeScript usamos string para representar GUIDs
  invoiceId: string;
  reason: string;
  cancellationDate: string; // Puedes usar Date si prefieres trabajar con objetos de fecha
  cancelledByUserId: string;
  invoice: Invoice;
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesCancelled {
  private readonly api = `${environment.apiUrl}/invoiceCancellation`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<InvoicesCancelled[]> {
    return this.http.get<InvoicesCancelled[]>(this.api);
  }

  cancelInvoice(cancellationData: { invoiceId: string; reason: string }): Observable<any> {
    return this.http.post<any>(`${this.api}`, cancellationData);
  }

  getAllInvoiceCancellations(): Observable<InvoicesCancelledDto[]> {
    return this.http.get<InvoicesCancelledDto[]>(`${this.api}`);
  }

}
