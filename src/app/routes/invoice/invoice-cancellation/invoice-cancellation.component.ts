import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Invoice, InvoiceDetail, InvoiceService } from '../invoice.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar ReactiveFormsModule
import { MaterialModule } from '../../../../../schematics/ng-add/files/module-files/app/material.module';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { InvoicesCancelled, InvoicesCancelledDto } from '../invoice-cancellation.service';

@Component({
  selector: 'app-invoice-cancellation',
  templateUrl: './invoice-cancellation.component.html',
  styleUrls: ['./invoice-cancellation.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // Asegúrate de agregarlo aquí
    MaterialModule,
  ],
})
export class InvoiceCancellationComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'quantity', 'unitPrice', 'totalPrice'];
  cancellationdisplayedColumns: string[] = [
    'invoiceNumber',
    'reason',
    'cancellationDate',
    'cancelledByUser',
  ];
  invoiceCancellations: InvoicesCancelledDto[] = [];
  invoiceSelectedDetail: InvoiceDetail[] = []; // Factura seleccionada
  cancellationForm!: FormGroup;
  invoiceId!: string; // ID de la factura a anular
  filteredInvoices: Invoice[] = []; // Lista de facturas filtradas
  private readonly toast = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicesCancelled = inject(InvoicesCancelled);
  searchControl = new FormControl('');
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInvoiceCancellations();
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Espera 300ms después de la última tecla
        distinctUntilChanged(), // Solo ejecuta si el valor cambió
        switchMap((value: any) => this.invoiceService.searchInvoiceByNumber(value)) // Llama al servicio de facturas
      )
      .subscribe(invoices => {
        this.filteredInvoices = invoices; // Almacena las facturas filtradas
      });

    this.cancellationForm = this.fb.group({
      reason: [null, Validators.required], // Campo para el motivo de anulación
    });

    // Obtener el ID de la factura si se pasa como parámetro en la URL
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') || '';
  }

  loadInvoiceCancellations(): void {
    this.invoicesCancelled.getAllInvoiceCancellations().subscribe(
      data => {
        this.invoiceCancellations = data;
      },
      error => {
        console.error('Error loading invoice cancellations', error);
      }
    );
  }

  onInvoiceSelected(invoiceNumber: any): void {
    // Asegúrate de que invoiceNumber no sea null
    if (!invoiceNumber) {
      this.toast.warning('No se ha seleccionado un número de factura.');
      return;
    }

    // Cuando se selecciona una factura del autocompletado
    const selectedInvoice = this.filteredInvoices.find(
      invoice => invoice.invoiceNumber === invoiceNumber
    );

    if (selectedInvoice) {
      // this.cancellationForm.patchValue({
      //   invoiceNumber: selectedInvoice.invoiceNumber,
      //   clientId: selectedInvoice.clientId,
      //   totalAmount: selectedInvoice.totalAmount,
      // });

      this.invoiceSelectedDetail = selectedInvoice.details ? selectedInvoice.details : []; // Asigna la factura seleccionada
      this.invoiceId = selectedInvoice.invoiceId;
    } else {
      this.toast.warning('Factura no encontrada.');
    }
  }

  onCancel(): void {
    if (this.cancellationForm.valid) {
      const cancellationData = {
        invoiceId: this.invoiceId,
        reason: this.cancellationForm.value.reason,
      };

      this.invoicesCancelled.cancelInvoice(cancellationData).subscribe(
        response => {
          this.toast.success('Factura anulada correctamente.');
        },
        error => {
          // this.toast.error('Error al anular la factura.');
        }
      );
    }
  }
}
