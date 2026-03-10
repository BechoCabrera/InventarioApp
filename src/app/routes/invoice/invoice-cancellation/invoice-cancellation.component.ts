import { Component, OnInit, ViewChild, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { InvoiceDto, InvoiceDetailDto } from '../create-invoice/models';
import { InvoiceService } from '../invoice.service';
import { InvoicesCancelled, InvoicesCancelledDto } from '../invoice-cancellation.service';

import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
import { MaterialModule } from '../../../../../schematics/ng-add/files/module-files/app/material.module';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { InvoicePosDialogComponent } from '@shared/pdf/invoice-pos-dialog/invoice-pos-dialog.component';

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

  displayedColumns: string[] = [
    'productName',
    'quantity',
    'unitPrice',
    'discountAmount',
    'promotionApplied',
    'totalPrice',
  ];
  cancellationdisplayedColumns: string[] = [
    'invoiceNumber',
    'reason',
    'cancellationDate',
    'cancelledByUser',
    'actions',
  ];

  invoiceCancellations = new MatTableDataSource<InvoicesCancelledDto>(); // ✅ datasource real
  invoiceSelectedDetail: InvoiceDetailDto[] = [];

  cancellationForm!: FormGroup;
  invoiceId!: string;
  filteredInvoices: InvoiceDto[] = [];
  searchControl = new FormControl('');
  isEntitiLoading = false;
  showCancelledStatus = false;

  private readonly toast = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicesCancelled = inject(InvoicesCancelled);
  private readonly dialog = inject(MatDialog);

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
        // Reasignar paginador y ordenamiento por si la referencia cambia
        if (this.paginator) {
          this.invoiceCancellations.paginator = this.paginator;
        }
        if (this.sort) {
          this.invoiceCancellations.sort = this.sort;
        }
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
      this.showCancelledStatus = false;
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

      this.isEntitiLoading = true;
      this.invoicesCancelled.cancelInvoice(cancellationData).subscribe({
        next: () => {
          this.toast.success('Factura anulada correctamente.');
          this.loadInvoiceCancellations(); // 🔄 refrescar tabla
          this.clearSelection();
          this.isEntitiLoading = false;
        },
        error: () => {
          // El interceptor global mostrará el mensaje de error del backend
          this.isEntitiLoading = false;
        },
      });
    }
  }

  // Opciones del menú (opcional)
  viewDetails(cancellation: InvoicesCancelledDto) {
    this.toast.info(`Detalles de ${cancellation.invoice}`);
  }

  downloadPdf(cancellation: InvoicesCancelledDto) {
    if (!cancellation?.invoiceNumber) {
      this.toast.warning('No se encontró el número de factura para descargar.');
      return;
    }

    this.loadInvoiceByNumber(cancellation.invoiceNumber, invoice => {
      // Mostrar también el estado ANULADA cuando se descarga el PDF
      this.showCancelledStatus = true;
      this.dialog.open(InvoicePosDialogComponent, {
        data: invoice,
      });
    });
  }

  // Muestra en la tabla superior los productos de la factura seleccionada
  showInvoiceDetail(cancellation: InvoicesCancelledDto): void {
    if (!cancellation?.invoiceNumber) {
      this.toast.warning('No se encontró el número de factura asociado.');
      return;
    }

    this.loadInvoiceByNumber(cancellation.invoiceNumber, invoice => {
      this.invoiceSelectedDetail = invoice.details ?? [];
      this.invoiceId = invoice.invoiceId;
      this.showCancelledStatus = true;
      // Desplazar suavemente el scroll hacia la parte superior del formulario
      if (typeof document !== 'undefined') {
        const topEl = document.getElementById('invoice-cancellation-top');
        if (topEl && 'scrollIntoView' in topEl) {
          topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

  /**
   * Carga una factura por número reutilizando la misma consulta del buscador,
   * y ejecuta una acción con la factura encontrada.
   */
  private loadInvoiceByNumber(
    invoiceNumber: string,
    onSuccess: (invoice: InvoiceDto) => void
  ): void {
    this.isEntitiLoading = true;
    this.invoiceService.searchInvoiceByNumberAndAnulation(invoiceNumber).subscribe({
      next: invoices => {
        const invoice = invoices && invoices.length > 0 ? invoices[0] : null;
        if (!invoice) {
          this.toast.warning('Factura no encontrada.');
        } else {
          onSuccess(invoice);
        }
        this.isEntitiLoading = false;
      },
      error: err => {
        console.error('Error buscando factura por número', err);
        this.toast.error('No se pudo obtener la información de la factura.');
        this.isEntitiLoading = false;
      },
    });
  }

  /**
   * Limpia selección, motivo, buscador y oculta el estado.
   */
  clearSelection(): void {
    this.invoiceSelectedDetail = [];
    this.invoiceId = '';
    this.filteredInvoices = [];
    this.searchControl.reset();
    if (this.cancellationForm) {
      this.cancellationForm.reset({ reason: null });
    }
    this.showCancelledStatus = false;
  }
}
