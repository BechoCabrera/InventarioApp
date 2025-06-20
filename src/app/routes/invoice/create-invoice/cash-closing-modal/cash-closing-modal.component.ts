import { Component, inject, Inject, OnInit } from '@angular/core';
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
import { CashClosing, CashClosingService } from './CashClosingService.service';
import { Toast, ToastrService } from 'ngx-toastr';

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
  private readonly toast = inject(ToastrService);
  constructor(
    public dialogRef: MatDialogRef<CashClosingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe la información de la factura
    private fb: FormBuilder, // Necesario para crear el formulario reactivo
    private invoiceService: InvoiceService, // Inyectamos el servicio de facturación
    private cashClosingService: CashClosingService // Inyectamos el servicio de facturación
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
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const currentDate = new Date();
    const formattedDate =
      currentDate.getFullYear() +
      '-' +
      ('0' + (currentDate.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + currentDate.getDate()).slice(-2);

    // Llamar al servicio para obtener las facturas del día
    this.invoiceService.getInvoicesByDate(formattedDate).subscribe(
      invoices => {
        // Inicializamos las variables totales
        this.totalCash = 0;
        this.totalCredit = 0;
        this.totalCard = 0;
        this.totalTransfer = 0;

        // Sumamos los totales de cada tipo de pago para las facturas del día
        invoices.forEach((invoice: any) => {
          // Sumar el total por cada tipo de pago
          if (invoice.paymentMethod === 'Efectivo') {
            this.totalCash += invoice.totalAmount;
          } else if (invoice.paymentMethod === 'Crédito') {
            this.totalCredit += invoice.totalAmount;
          } else if (invoice.paymentMethod === 'Tarjeta') {
            this.totalCard += invoice.totalAmount;
          } else if (invoice.paymentMethod === 'Tranferencia') {
            this.totalTransfer += invoice.totalAmount;
          }
        });

        // Calcular el total general
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
        // Manejo de errores
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

    // Crear el objeto del cierre de caja
    const cashClosing = {
      totalCash: this.totalCash,
      totalCredit: this.totalCredit,
      totalCard: this.totalCard,
      totalTransfer: this.totalTransfer,
      totalAmount: this.totalAmount,
      changeAmount: this.changeAmount,
    };

    // Llamar al servicio para guardar el cierre de caja
    this.cashClosingService.saveCashClosing(cashClosing).subscribe(
      response => {
        this.dialogRef.close();
        this.toast.success('Cierre de caja guardado con éxito');
      },
      error => {
        this.toast.warning('No se puedo generar el cierre de caja.' + error);
      }
    );
  }

  closeModal(): void {
    this.dialogRef.close(); // Cierra el modal sin guardar
  }
}
