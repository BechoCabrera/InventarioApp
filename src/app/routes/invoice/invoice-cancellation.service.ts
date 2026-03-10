import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { InvoiceDto } from './create-invoice/models';


export interface InvoicesCancelledDto {
  invoiceCancelledId: string;
  invoiceId: string;
  invoiceNumber: string;
  reason: string;
  cancellationDate: string;
  cancelledByUserId: string;
  cancelledByUser: string;
  invoice: InvoiceDto;
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
