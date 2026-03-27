import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

export interface MultiPaymentItem {
  paymentMethod: string;
  amount: number;
}

export interface MultiPaymentModalData {
  totalAmount: number;
  payments?: MultiPaymentItem[];
}

@Component({
  selector: 'app-multi-payment-modal',
  standalone: true,
  templateUrl: './multi-payment-modal.component.html',
  styleUrls: ['./multi-payment-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
})
export class MultiPaymentModalComponent {
  paymentForm: FormGroup;
  payments: MultiPaymentItem[] = [];
  displayedColumns: string[] = ['paymentMethod', 'amount', 'actions'];
  addError = '';

  paymentMethods: string[] = ['Transferencia', 'Efectivo', 'Crédito', 'Tarjeta'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MultiPaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MultiPaymentModalData
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
    });

    this.payments = [...(data.payments || [])];
  }

  get totalAssigned(): number {
    return this.toMoney(this.payments.reduce((sum, item) => sum + item.amount, 0));
  }

  get remainingAmount(): number {
    return this.toMoney(Math.max(0, this.data.totalAmount - this.totalAssigned));
  }

  addPayment(): void {
    this.addError = '';

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const paymentMethod = this.paymentForm.get('paymentMethod')?.value as string;
    const amountValue = this.paymentForm.get('amount')?.value;
    const amount = Number(amountValue);

    if (!Number.isFinite(amount) || amount <= 0) {
      this.addError = 'El valor debe ser mayor a cero.';
      return;
    }

    const existingIndex = this.payments.findIndex(item => item.paymentMethod === paymentMethod);
    const projectedTotal =
      existingIndex >= 0
        ? this.toMoney(this.totalAssigned + amount)
        : this.toMoney(this.totalAssigned + amount);

    if (projectedTotal > this.toMoney(this.data.totalAmount)) {
      this.addError = 'La suma de pagos no puede superar el total de la factura.';
      return;
    }

    if (existingIndex >= 0) {
      const current = this.payments[existingIndex];
      const updatedAmount = this.toMoney(current.amount + amount);
      this.payments = this.payments.map((item, index) =>
        index === existingIndex ? { ...item, amount: updatedAmount } : item
      );
    } else {
      this.payments = [...this.payments, { paymentMethod, amount: this.toMoney(amount) }];
    }

    this.paymentForm.reset();
  }

  removePayment(index: number): void {
    this.payments = this.payments.filter((_, i) => i !== index);
    this.addError = '';
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (this.toMoney(this.totalAssigned) !== this.toMoney(this.data.totalAmount)) {
      this.addError = 'La suma de pagos debe ser igual al total de la factura.';
      return;
    }

    this.dialogRef.close({ payments: this.payments });
  }

  private toMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
