import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Invoice, InvoiceService } from '../invoice.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { InvoicePosPdfComponent } from '../../../shared/pdf/invoice-pos-pdf/invoice-pos-pdf.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class InvoiceHistoryComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedInvoice: Invoice | null = null;
  dataSource = new MatTableDataSource<Invoice>();
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
      next: data => {
        this.dataSource.data = data;
        this.dataSource.filterPredicate = (data, filter) =>
          data.clientName.toLowerCase().includes(filter) ||
          data.invoiceNumber.toLowerCase().includes(filter) ||
          data.status.toLowerCase().includes(filter);
      },
      error: () => console.error('Error cargando facturas'),
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openInvoiceDialog(invoice: Invoice): void {
    this.dialog.open(InvoicePosDialogComponent, {
      data: invoice,
    });
  }
}
