import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stock-adjustment-modal',
  templateUrl: './stock-adjustment-modal.component.html',
  styleUrls: ['./stock-adjustment-modal.component.scss'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  standalone: true,
})

export class StockAdjustmentModalComponent {
  form: FormGroup;
  action: 'increase' | 'decrease';
  productName: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StockAdjustmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.action = data.action;
    this.productName = data.productName;

    this.form = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  // Método para confirmar el ajuste
  confirmAdjustment(): void {
    if (this.form.invalid) {
      return;
    }
    const quantity = this.form.get('quantity')?.value;

    // Se envía la cantidad y la acción confirmada
    this.dialogRef.close({
      quantity,
      action: this.action,
      confirm: true,  // Indica que la acción fue confirmada
    });
  }

  // Método para cancelar el ajuste
  closeModal(): void {
    // Se cierra el modal con el valor confirm: false, indicando que fue cancelado
    this.dialogRef.close({
      confirm: false,  // Indica que la acción fue cancelada
    });
  }
}
