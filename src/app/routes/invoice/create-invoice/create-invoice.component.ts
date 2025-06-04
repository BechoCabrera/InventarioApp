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
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateAdapter } from '@angular/material/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
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
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatAutocompleteModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-CO' }],
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
  filteredProducts: Product[] = [];
  productSearchTimeouts: Record<number, any> = {};
  private readonly toast = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceService);

  constructor(
    private clientService: ClientService,
    private productService: ProductService,
    private dateAdapter: DateAdapter<any>
  ) {}
  ngOnInit(): void {
    this.dateAdapter.setLocale('es-CO');
    const today = new Date();
    const dueIn30Days = new Date();
    dueIn30Days.setDate(today.getDate() + 30);

    this.form = this.fb.group(
      {
        productSearch: [''],
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        invoiceNumber: [null, Validators.required],
        clientId: [null, Validators.required],
        issueDate: [today, Validators.required],
        dueDate: [dueIn30Days, Validators.required],
        subtotalAmount: [0, Validators.required],
        taxAmount: [0, Validators.required],
        totalAmount: [0, Validators.required],
        status: ['Emitida', Validators.required],
        paymentMethod: [''],
        details: this.fb.array([]),
      },
      {
        validators: this.dueDateAfterIssueDateValidator(),
      }
    );
    this.loadClients();
    this.loadProducts();
    this.loadInvoices();
  }

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  onProductSelected(i: number, name: string): void {
    const selected = this.filteredProducts.find(p => p.name === name);
    if (selected) this.setProduct(i, selected);
  }

  setProduct(i: number, product: Product): void {
    const group = this.details.at(i);
    group.patchValue({
      productId: product.productId,
      unitPrice: product.unitPrice,
      stock: product.stock,
      productSearch: product.name,
    });
  }
  onBlurSearch(): void {
    // si el input se queda con texto pero no se seleccionó nada, puedes validarlo
  }

  dueDateAfterIssueDateValidator() {
    return (formGroup: FormGroup) => {
      const issueDate = formGroup.get('issueDate')?.value;
      const dueDate = formGroup.get('dueDate')?.value;

      if (!issueDate || !dueDate) return null;

      return new Date(dueDate) < new Date(issueDate) ? { dueBeforeIssue: true } : null;
    };
  }

  addDetail(): void {
    const group = this.fb.group({
      productSearch: [''],
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      stock: [0],
    });

    this.details.push(group);
    this.filteredProducts = [];
  }

  handleProductSearch(value: string, index: number): void {
    if (!value) return;

    if (/^\d+$/.test(value)) {
      this.productService.getByBarCode(value).subscribe(product => {
        if (product) this.setProduct(index, product);
      });
    } else {
      this.productService.searchByName(value).subscribe(products => {
        this.filteredProducts = products;
      });
    }
  }

  onDebouncedSearch(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (this.productSearchTimeouts[index]) {
      clearTimeout(this.productSearchTimeouts[index]);
    }

    this.productSearchTimeouts[index] = setTimeout(() => {
      this.handleProductSearch(value, index);
    }, 300);
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
