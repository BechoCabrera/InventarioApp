import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Invoice, InvoiceDetail } from '../../invoice.service';
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
  invoice: Invoice; // Aquí almacenamos la factura que se va a mostrar
  invoiceDetail?:InvoiceDetail[]
displayedColumns: string[] = ['productName', 'quantity', 'total'];
  constructor(
    public dialogRef: MatDialogRef<InvoiceDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.invoice = data.invoice; // Recibimos la factura desde el componente que abre el modal
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.dialogRef.close();
  }
}
