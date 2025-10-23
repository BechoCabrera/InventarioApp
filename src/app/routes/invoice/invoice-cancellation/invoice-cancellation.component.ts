import { Component, OnInit, ViewChild, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Invoice, InvoiceDetail, InvoiceService } from '../invoice.service';
import { InvoicesCancelled, InvoicesCancelledDto } from '../invoice-cancellation.service';

import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
import { MaterialModule } from '../../../../../schematics/ng-add/files/module-files/app/material.module';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-invoice-cancellation',
  templateUrl: './invoice-cancellation.component.html',
  styleUrls: ['./invoice-cancellation.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    LoadingOverlayComponent,
  ],
})
export class InvoiceCancellationComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['productName', 'quantity', 'unitPrice', 'totalPrice'];
  cancellationdisplayedColumns: string[] = [
    'invoiceNumber',
    'reason',
    'cancellationDate',
    'cancelledByUser',
  ];

  invoiceCancellations = new MatTableDataSource<InvoicesCancelledDto>(); // ✅ datasource real
  invoiceSelectedDetail: InvoiceDetail[] = [];

  cancellationForm!: FormGroup;
  invoiceId!: string;
  filteredInvoices: Invoice[] = [];
  searchControl = new FormControl('');
  isEntitiLoading = false;

  private readonly toast = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicesCancelled = inject(InvoicesCancelled);

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadInvoiceCancellations();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: any) => this.invoiceService.searchInvoiceByNumber(value))
      )
      .subscribe(invoices => {
        this.filteredInvoices = invoices;
      });

    this.cancellationForm = this.fb.group({
      reason: [null, Validators.required],
    });

    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') || '';
  }

  ngAfterViewInit() {
    // ⏳ se enlazan después de que la vista carga
    this.invoiceCancellations.paginator = this.paginator;
    this.invoiceCancellations.sort = this.sort;
  }

  // ✅ Carga las anulaciones
  loadInvoiceCancellations(): void {
    this.isEntitiLoading = true;
    this.invoicesCancelled.getAllInvoiceCancellations().subscribe({
      next: data => {
        this.invoiceCancellations.data = data; // ✅ asignación correcta
        this.isEntitiLoading = false;
      },
      error: err => {
        console.error('Error loading invoice cancellations', err);
        this.isEntitiLoading = false;
      },
    });
  }

  onInvoiceSelected(invoiceNumber: any): void {
    if (!invoiceNumber) {
      this.toast.warning('No se ha seleccionado un número de factura.');
      return;
    }

    const selectedInvoice = this.filteredInvoices.find(
      invoice => invoice.invoiceNumber === invoiceNumber
    );

    if (selectedInvoice) {
      this.invoiceSelectedDetail = selectedInvoice.details ?? [];
      this.invoiceId = selectedInvoice.invoiceId;
    } else {
      this.toast.warning('Factura no encontrada.');
    }
  }

  // ✅ búsqueda en la tabla inferior
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.invoiceCancellations.filter = filterValue.trim().toLowerCase();
  }

  onCancel(): void {
    if (this.cancellationForm.valid) {
      const cancellationData = {
        invoiceId: this.invoiceId,
        reason: this.cancellationForm.value.reason,
      };

      this.invoicesCancelled.cancelInvoice(cancellationData).subscribe({
        next: () => {
          this.toast.success('Factura anulada correctamente.');
          this.loadInvoiceCancellations(); // 🔄 refrescar tabla
        },
        error: () => {
          this.toast.error('Error al anular la factura.');
        },
      });
    }
  }

  // Opciones del menú (opcional)
  viewDetails(cancellation: InvoicesCancelledDto) {
    this.toast.info(`Detalles de ${cancellation.invoice}`);
  }

  downloadPdf(cancellation: InvoicesCancelledDto) {
    this.toast.info(`Descargando PDF de ${cancellation.invoice}`);
  }
}
