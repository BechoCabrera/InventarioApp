import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Invoice, InvoiceService } from '../invoice.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { InvoicePosPdfComponent } from '../../../shared/pdf/invoice-pos-pdf/invoice-pos-pdf.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { InvoicePosDialogComponent } from '../../../shared/pdf/invoice-pos-dialog/invoice-pos-dialog.component';
@Component({
  standalone: true,
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss'],

  imports: [
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    CommonModule,
    InvoicePosPdfComponent,
    MatDialogModule,
    InvoicePosDialogComponent,
  ],
})
export class InvoiceHistoryComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  selectedInvoice: Invoice | null = null;
  invoices: Invoice[] = [];
  displayedColumns = [
    'invoiceNumber',
    'client',
    'issueDate',
    'totalAmount',
    'status',
    'entitiName',
    'actions',
  ];

  constructor(
    private invoiceService: InvoiceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.invoiceService.getAllInvoices().subscribe({
      next: data => (this.invoices = data),
      error: () => console.error('Error cargando facturas'),
    });
  }

  openInvoiceDialog(invoice: Invoice): void {
    this.dialog.open(InvoicePosDialogComponent, {
      data: invoice,
      width: '380px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
    });
  }
}
