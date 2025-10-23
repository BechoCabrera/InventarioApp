import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-payment-warning-modal',
  templateUrl: './payment-warning-modal.component.html',
  styleUrls: ['./payment-warning-modal.component.scss'],
  imports: [CommonModule, MatIconModule, MatButtonModule]
})
export class PaymentWarningModalComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentWarningModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string; allowClose: boolean }
  ) {}

  close(): void {
    if (this.data.allowClose) {
      this.dialogRef.close(true);
    }
  }
}
