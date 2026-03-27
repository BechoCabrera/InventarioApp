import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { InvoiceDto, InvoiceDetailDto, InvoicePaymentDto } from '../../create-invoice/models';
import { MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-invoice-details-modal',
  templateUrl: './invoice-details-modal.component.html',
  styleUrls: ['./invoice-details-modal.component.scss'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatTableModule
  ],
})
export class InvoiceDetailsModalComponent {
  invoice: InvoiceDto; // Aquí almacenamos la factura que se va a mostrar
  invoiceDetail?: InvoiceDetailDto[];
  displayedColumns: string[] = ['productName', 'quantity', 'total'];
  paymentColumns: string[] = ['paymentMethod', 'amount'];
  constructor(
    public dialogRef: MatDialogRef<InvoiceDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.invoice = data.invoice; // Recibimos la factura desde el componente que abre el modal
    this.invoiceDetail = this.invoice.details;
  }

  get paymentBreakdown(): InvoicePaymentDto[] {
    return this.invoice.paymentBreakdown || [];
  }

  get hasPaymentBreakdown(): boolean {
    return this.paymentBreakdown.length > 0;
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.dialogRef.close();
  }
}
