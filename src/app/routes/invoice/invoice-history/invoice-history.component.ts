import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  AfterViewInit,
  LOCALE_ID,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { Invoice, InvoiceService } from '../invoice.service';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvoicePosDialogComponent } from '@shared/pdf/invoice-pos-dialog/invoice-pos-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/modal/confirm-dialog/confirm-dialog.component';

import { InvoicePosPdfComponent } from '@shared/pdf/invoice-pos-pdf/invoice-pos-pdf.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
import { InvoiceDetailsModalComponent } from './invoice-details-modal/invoice-details-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '@shared/services/shared.service';

registerLocaleData(localeCo, 'es-CO');

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
    LoadingOverlayComponent,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }], // 👈 Aquí está la clave
})
export class InvoiceHistoryComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  private dateAdapter = inject(DateAdapter);
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isEntitiLoading = false;
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

  // Filtros
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedPaymentMethod: string = '';
  selectedStatus: string = '';
  invoiceNumber: string = '';
  searchText: string = '';
  // Backup para aplicar filtros sobre el dataset completo
  private allInvoices: Invoice[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {
    this.dateAdapter.setLocale('es-CO');
  }

  ngOnInit(): void {
    // this.invoiceService.getAllInvoices().subscribe({
    //   next: data => {
    //     this.dataSource.data = data;
    //     this.dataSource.filterPredicate = (data, filter) =>
    //       data.clientName.toLowerCase().includes(filter) ||
    //       data.invoiceNumber.toLowerCase().includes(filter) ||
    //       data.status.toLowerCase().includes(filter);
    //     this.isEntitiLoading = false;
    //   },
    //   error: () => {
    //     console.error('Error cargando facturas');
    //     this.isEntitiLoading = false;
    //   },
    // });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // Si no hay texto -> restaurar la última búsqueda completa
    if (!filterValue) {
      this.dataSource.data = [...this.allInvoices];
      return;
    }

    // Filtrar sobre los resultados actuales
    this.dataSource.data = this.allInvoices.filter(
      inv =>
        inv.clientName?.toLowerCase().includes(filterValue) ||
        inv.invoiceNumber?.toLowerCase().includes(filterValue)
    );
  }

  // Filtro avanzado
  applyAdvancedFilter(): void {
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      alert('La fecha final no puede ser menor que la inicial');
      return;
    }

    this.dataSource.data = this.allInvoices.filter(inv => {
      const fecha = new Date(inv.issueDate);
      const matchFechaInicio = !this.startDate || fecha >= this.startDate;
      const matchFechaFin = !this.endDate || fecha <= this.endDate;
      const matchPago =
        !this.selectedPaymentMethod || inv.paymentMethod === this.selectedPaymentMethod;
      const matchEstado =
        !this.selectedStatus ||
        (this.selectedStatus === 'activa' && !inv.isCancelled) ||
        (this.selectedStatus === 'anulada' && inv.isCancelled);

      return matchFechaInicio && matchFechaFin && matchPago && matchEstado;
    });
  }

  openInvoiceDialog(invoice: Invoice): void {
    this.dialog.open(InvoicePosDialogComponent, {
      data: invoice,
    });
  }

  openInvoiceDetailDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(InvoiceDetailsModalComponent, {
      width: '500px', // Ancho del modal
      data: { invoice }, // Pasamos la factura seleccionada al modal
    });

    // Opcionalmente, puedes manejar lo que pasa después de que se cierra el modal
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Modal cerrado');
      }
    });
  }

  searhInvoice(): void {
    // Validaciones básicas
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.sharedService.warning(
        'Advertencia',
        'La fecha final no puede ser menor que la inicial.'
      );
      return;
    }

    this.isEntitiLoading = true;

    const filters = {
      startDate: this.startDate,
      endDate: this.endDate,
      paymentMethod: this.selectedPaymentMethod || null,
      isCancelled:
        this.selectedStatus === 'anulada' ? true : this.selectedStatus === 'activa' ? false : null,
      invoiceNumber: this.invoiceNumber?.trim() || null,
    };

    this.invoiceService.getInvoicesByFilter(filters).subscribe({
      next: data => {
        this.allInvoices = data;
        this.dataSource.data = data;
        this.isEntitiLoading = false;
      },
      error: err => {
        console.error('Error cargando facturas filtradas:', err);
        this.isEntitiLoading = false;
      },
    });
  }

  clear(): void {
    this.startDate = null;
    this.endDate = null;
    this.selectedPaymentMethod = '';
    this.selectedStatus = '';
    this.searchText = '';
    this.invoiceNumber = '';
    this.dataSource.data = [];
  }
}
