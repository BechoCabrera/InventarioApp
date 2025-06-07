import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { InvoicePosPdfComponent } from '../invoice-pos-pdf/invoice-pos-pdf.component';

@Component({
  selector: 'app-invoice-pos-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, InvoicePosPdfComponent],
  template: `
    <div class="dialog-wrapper">
      <div style="display: flex; justify-content: flex-end; padding: 0 16px 8px 16px;">
        <button mat-button color="warn" (click)="close()">Cerrar ✖</button>
      </div>
      <app-invoice-pos-pdf [invoice]="data" (afterDownload)="close()" />
    </div>
  `,
  styles: [
    `
      .dialog-wrapper {
        padding: 0;
        margin: 0;
        background-color: white;
        max-width: 100%;
        animation: fadeInSlideUp 0.3s ease-in-out;
      }

      @keyframes fadeInSlideUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class InvoicePosDialogComponent {
  public data: any;
  constructor(
    public dialogRef: MatDialogRef<InvoicePosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.data = data;
  }
  close(): void {
    this.dialogRef.close();
  }
}
