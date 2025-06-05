import { Component, ElementRef, OnInit, ViewChild, inject, AfterViewInit } from '@angular/core';
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
export class CreateInvoiceComponent implements OnInit, AfterViewInit {
  invoices: Invoice[] = [];
  @ViewChild('productSearch') productSearchInput!: ElementRef;
  clients: Client[] = [];
  products: Product[] = [];

  selectedPaymentMethod = '';

  private readonly toast = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);
  form!: FormGroup;
  displayedColumns: string[] = ['barCode', 'name', 'quantity', 'unitPrice', 'actions'];
  filteredProducts: Product[] = [];
  productSearchTimeouts: Record<number, number | ReturnType<typeof setTimeout>> = {};

  constructor(
    private clientService: ClientService,
    private productService: ProductService,
    private dateAdapter: DateAdapter<any>,
    private fb: FormBuilder
  ) {}

  ngAfterViewInit(): void {
    if (this.productSearchInput) {
      this.productSearchInput.nativeElement.focus();
    }
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      details: this.fb.array([]),
      // Otros controles del formulario si es necesario
      invoiceNumber: [null, Validators.required],
      clientId: [null, Validators.required],
      issueDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      subtotalAmount: [0, Validators.required],
      taxAmount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      status: ['Emitida', Validators.required],
      paymentMethod: [''],
    });
    this.details.valueChanges.subscribe(() => {
      this.updateTotals();
    });

    this.loadClients();
  }

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  get filteredDetails(): any[] {
    return this.details.controls.map((detail: any) => detail.value);
  }

  onProductSelected(name: string): void {
    // Verificar si el producto ya está en la lista
    const selectedProduct = this.filteredProducts.find(p => p.name === name);

    if (!selectedProduct) {
      this.toast.warning('Producto no encontrado.');
      return;
    }

    // Verificar si el producto ya está en la lista de detalles
    const isProductAlreadyAdded =
      (this.details.controls as FormGroup[]).filter(
        (detail: FormGroup) => detail.get('productId')?.value === selectedProduct.productId
      ).length > 0;

    if (isProductAlreadyAdded) {
      this.toast.warning('Este producto ya está en la lista.');
      return;
    }

    // Agregar un nuevo detalle solo si el producto no está ya agregado
    const currentGroup = this.fb.group({
      barCode: [selectedProduct.barCode],
      name: [selectedProduct.name],
      productSearch: [selectedProduct.name],
      productId: [selectedProduct.productId, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [selectedProduct.unitPrice, [Validators.required, Validators.min(0)]],
    });

    // Agregar el nuevo producto al array de detalles
    this.details.push(currentGroup);
    console.log(this.details.value);
    // Limpiar el campo de búsqueda de productos
    this.details
      .at(this.details.length - 1)
      .get('productSearch')
      ?.reset();

    // Limpiar el texto visible en el input de búsqueda (en caso de que el formulario no lo limpie automáticamente)
    const productSearchInput = document.querySelector(
      'input[formControlName="productSearch"]'
    ) as HTMLInputElement;
    if (productSearchInput) {
      productSearchInput.value = ''; // Limpiamos el valor visualmente en el input
    }
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

  handleProductSearch(value: string, index: number): void {
    if (!value || value.length < 4) return; // Asegúrate de que el valor sea lo suficientemente largo para buscar

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

  onDebouncedSearch(event: any): void {
    const value = event.target.value;

    // Si el campo está vacío, limpiamos los productos filtrados y salimos
    if (value === '') {
      this.filteredProducts = [];
      return;
    }

    // Si ya existe un timeout, lo limpiamos antes de crear uno nuevo
    if (this.productSearchTimeouts) {
      clearTimeout(this.productSearchTimeouts[event.target.value]);
    }

    // Esperamos 300ms después de la última tecla presionada para hacer la consulta
    this.productSearchTimeouts[event.target.value] = setTimeout(() => {
      // Realizamos la consulta por el código de barras cuando el valor tenga longitud suficiente
      if (value.length >= 13) {
        // Asegúrate de que el código de barras tenga una longitud adecuada
        this.productService.getByBarCode(value).subscribe(products => {
          // Si encontramos el producto, lo agregamos automáticamente a la tabla
          if (products != null) {
            const selectedProduct: Product = products;
            // Verificamos si el producto ya está en la tabla
            const isProductAlreadyAdded =
              (this.details.controls as FormGroup[]).filter(
                (detail: FormGroup) => detail.get('productId')?.value === selectedProduct.productId
              ).length > 0;

            if (!isProductAlreadyAdded) {
              this.addDetailProduct(selectedProduct);
            } else {
              this.toast.warning('Este producto ya está en la lista.');
              this.clearProductSearchInput();
            }
          } else {
            this.toast.warning('Producto no encontrado.');
          }
        });
      }
    }, 300); // 300ms para el debounce, puedes ajustar según el comportamiento del lector
  }

  addDetailProduct(selectedProduct: Product) {
    const currentGroup = this.fb.group({
      barCode: [selectedProduct.barCode],
      name: [selectedProduct.name],
      productSearch: [selectedProduct.name], // Agregamos el nombre del producto
      productId: [selectedProduct.productId, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [selectedProduct.unitPrice, [Validators.required, Validators.min(0)]],
    });

    // Agregamos el producto al FormArray
    this.details.push(currentGroup);
    this.toast.success('Producto agregado:', selectedProduct.name);
    this.clearProductSearchInput();
  }

  removeDetail(index: number): void {
    if (index >= 0) {
      this.details.removeAt(index); // Elimina el control en la posición 'index'
      this.toast.success('Producto eliminado correctamente');
    } else {
      this.toast.warning('No se pudo eliminar el producto.');
    }
  }

  clearProductSearchInput() {
    const productSearchInput = document.querySelector(
      'input[formControlName="productSearch"]'
    ) as HTMLInputElement;
    if (productSearchInput) {
      productSearchInput.value = ''; // Limpiamos el valor visualmente en el input
    }
  }

  removeDetails(index: number): void {
    this.details.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (this.details.length === 0) {
      this.toast.warning('Debe agregar al menos un producto a la factura');
      return;
    }
    const invoice = this.form.value;

    this.invoiceService.create(invoice).subscribe({
      next: () => {
        this.toast.success('Factura guardada con éxito');

        this.form.reset();
        this.details.clear();
        this.form.patchValue({
          subtotalAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          status: 'Emitida',
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        });
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

  editInvoice(event: any) {}

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    this.form.patchValue({ paymentMethod: method });
  }

  updateTotals(): void {
    const details = this.details.value;
    let subtotal = 0;

    details.forEach((item: any) => {
      subtotal += (item.unitPrice || 0) * (item.quantity || 0);
    });

    const tax = subtotal * 0.19; // Ejemplo con IVA 19%
    const total = subtotal + tax;

    this.form.patchValue({
      subtotalAmount: subtotal,
      taxAmount: tax,
      totalAmount: total,
    });
  }

  updateQuantity(detail: any): void {
    const quantity = detail.get('quantity').value;
    const unitPrice = detail.get('unitPrice').value;
    const total = quantity * unitPrice;
    // Aquí puedes actualizar el total de la factura si es necesario.
  }
}
