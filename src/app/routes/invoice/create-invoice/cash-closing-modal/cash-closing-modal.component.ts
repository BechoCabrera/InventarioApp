import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Invoice, InvoiceService } from '../../invoice.service';

@Component({
  selector: 'app-cash-closing-modal',
  templateUrl: './cash-closing-modal.component.html',
  styleUrls: ['./cash-closing-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
})
export class CashClosingModalComponent implements OnInit {
  cashClosingForm: FormGroup; // Formulario reactivo
  totalAmount: number = 0; // Monto total de la factura
  changeAmount: number = 0; // Monto de cambio a devolver
  totalCash: number = 0;
  totalCredit: number = 0;
  totalCard: number = 0;
  totalTransfer: number = 0;
  invoices: Invoice[] = [];
  constructor(
    public dialogRef: MatDialogRef<CashClosingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe la información de la factura
    private fb: FormBuilder, // Necesario para crear el formulario reactivo
    private invoiceService: InvoiceService // Inyectamos el servicio de facturación
  ) {
    // Crea el formulario reactivo
    this.cashClosingForm = this.fb.group({
      totalCash: [0, [Validators.required, Validators.min(0)]],
      totalCredit: [0, [Validators.required, Validators.min(0)]],
      totalCard: [0, [Validators.required, Validators.min(0)]],
      totalTransfer: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Cargar la información al abrir el modal
    this.loadDailySalesData();
  }

  // Función que obtiene las facturas del día y calcula los totales
  loadDailySalesData(): void {
    const currentDate = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy en formato YYYY-MM-DD

    this.invoiceService.getInvoicesByDate(currentDate).subscribe(
      invoices => {
        // Sumamos los totales de cada tipo de pago
        this.totalCash = invoices.reduce((total, invoice:any) => total + invoice.totalCash, 0);
        this.totalCredit = invoices.reduce((total, invoice:any) => total + invoice.totalCredit, 0);
        this.totalCard = invoices.reduce((total, invoice:any) => total + invoice.totalCard, 0);
        this.totalTransfer = invoices.reduce((total, invoice:any) => total + invoice.totalTransfer, 0);

        // Calcular el total general (suma de todos los tipos de pago)
        this.totalAmount = this.totalCash + this.totalCredit + this.totalCard + this.totalTransfer;

        // Actualizamos el formulario reactivo con los totales calculados
        this.cashClosingForm.patchValue({
          totalCash: this.totalCash,
          totalCredit: this.totalCredit,
          totalCard: this.totalCard,
          totalTransfer: this.totalTransfer,
        });
      },
      error => {
        console.error('Error al cargar las facturas:', error);
      }
    );
  }

  // Calcula el cambio
  calculateChangeAmount(): void {
    const amountPaid = this.totalCash + this.totalCredit + this.totalCard + this.totalTransfer;
    this.changeAmount = amountPaid - this.totalAmount;
  }

  // Llama a un método en el servicio para guardar el cierre de caja
  saveCashClosing(): void {
    const amountPaid = this.totalCash + this.totalCredit + this.totalCard + this.totalTransfer;

    if (amountPaid < this.totalAmount) {
      alert('El monto pagado es menor al total.');
      return;
    }

    // Aquí puedes llamar a tu servicio para guardar el cierre de caja

    this.dialogRef.close(); // Cierra el modal después de guardar
  }

  closeModal(): void {
    this.dialogRef.close(); // Cierra el modal sin guardar
  }
}
