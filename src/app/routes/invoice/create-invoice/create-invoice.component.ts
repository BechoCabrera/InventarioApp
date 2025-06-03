import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Invoice, InvoiceService } from '../invoice.service';
import { Client, ClientService } from 'app/routes/client/client.service';
import { Product, ProductService } from 'app/routes/product/product.service';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
  ],
})
export class CreateInvoiceComponent implements OnInit {
  form!: FormGroup;
  invoices: Invoice[] = [];
  displayedColumns: string[] = [
    'invoiceNumber',
    'clientId',
    'issueDate',
    'totalAmount',
    'status',
    'actions',
  ];
  clients: Client[] = [];
  products: Product[] = [];
  private readonly toast = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceService);

  constructor(
    private clientService: ClientService,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.form = this.fb.group({
      invoiceNumber: [null, Validators.required],
      clientId: [null, Validators.required],
      issueDate: [null, Validators.required],
      dueDate: [null, Validators.required],
      subtotalAmount: [0, Validators.required],
      taxAmount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      status: ['Emitida', Validators.required],
      paymentMethod: [''],
      details: this.fb.array([]),
    });
    this.loadClients();
    this.loadProducts();
    this.loadInvoices();
  }

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  addDetail(): void {
    this.details.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  loadInvoices(): void {
    this.invoiceService.getAll().subscribe({
      next: data => (this.invoices = data),
      error: err => {
        this.toast.error('Error al cargar facturas');
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const invoice = this.form.value;
    this.invoiceService.create(invoice).subscribe({
      next: () => {
        this.toast.success('Factura guardada con éxito');
        this.form.reset();
        this.details.clear();
        this.loadInvoices();
      },
      error: err => {
        this.toast.error('Error al guardar factura');
        console.error(err);
      },
    });
  }
  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: data => (this.clients = data),
      error: () => this.toast.error('Error cargando clientes'),
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: data => (this.products = data),
      error: () => this.toast.error('Error cargando productos'),
    });
  }
  editInvoice(event: any) {}
}
