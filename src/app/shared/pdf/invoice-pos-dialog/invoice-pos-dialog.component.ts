import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvoicePosPdfComponent } from '../invoice-pos-pdf/invoice-pos-pdf.component'; // ✅ importa bien la ruta
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common'; // 👈 AÑADE ESTO

@Component({
  selector: 'app-invoice-pos-dialog',
  standalone: true,
  templateUrl: './invoice-pos-dialog.component.html',
  styleUrls: ['./invoice-pos-dialog.component.scss'],
  imports: [InvoicePosPdfComponent, MatProgressSpinnerModule, CommonModule], // ✅ importa aquí
})
export class InvoicePosDialogComponent {
  @ViewChild('childRef') child!: InvoicePosPdfComponent;
  constructor(
    public dialogRef: MatDialogRef<InvoicePosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  print(): void {
    if (!this.child.isLoading) {
      this.child.download();
    }
  }
  close(): void {
    this.dialogRef.close();
  }
}
