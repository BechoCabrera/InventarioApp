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
} from '@angular/forms';
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
import { debounceTime, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { MatDialog } from '@angular/material/dialog';
import { InvoicePosDialogComponent } from '@shared/pdf/invoice-pos-dialog/invoice-pos-dialog.component';
import { CashClosingModalComponent } from './cash-closing-modal/cash-closing-modal.component';

registerLocaleData(localeCo, 'es-CO');
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
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
})
export class CreateInvoiceComponent implements OnInit, AfterViewInit {
  invoices: Invoice[] = [];
  @ViewChild('productSearch') productSearchInput!: ElementRef;
  clients: Client[] = [];
  products: Product[] = [];
  changeAmount: number = 0;
  selectedPaymentMethod = '';

  private readonly toast = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);
  form!: FormGroup;
  displayedColumns: string[] = ['barCode', 'name', 'stock', 'quantity', 'unitPrice', 'actions'];
  filteredProducts: Product[] = [];
  productSearchTimeouts: Record<number, number | ReturnType<typeof setTimeout>> = {};
  searchControl = new FormControl('');
  constructor(
    private clientService: ClientService,
    private productService: ProductService,
    private dateAdapter: DateAdapter<any>,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    if (this.productSearchInput) {
      this.productSearchInput.nativeElement.focus();
    }
  }
  ngOnInit(): void {
    this.dateAdapter.setLocale('es-CO');

    this.form = this.fb.group({
      details: this.fb.array([]),
      clientId: [null, Validators.required],
      issueDate: [{ value: new Date(), disabled: true }, Validators.required],
      dueDate:  [{ value: new Date(), disabled: true }, Validators.required],
      subtotalAmount: [0],
      taxAmount: [0],
      totalAmount: [0],
      status: ['Generado'],
      paymentMethod: [null, Validators.required],
      amountPaid: [null, [Validators.required, Validators.min(0)]],
    });

    this.form.get('amountPaid')?.valueChanges.subscribe(() => {
      const paid = this.form.get('amountPaid')?.value || 0;
      const total = this.form.get('totalAmount')?.value || 0;

      if (paid < total) {
        this.form.get('amountPaid')?.setErrors({ insufficient: true });
      } else {
        this.form.get('amountPaid')?.setErrors(null);
      }

      this.calculateChangeAmount();
    });

    this.form.get('totalAmount')?.valueChanges.subscribe(() => {
      this.calculateChangeAmount();
    });

    this.details.valueChanges.subscribe(() => {
      this.updateTotals();
    });

    this.loadClients();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Espera 1 segundo después de la última tecla
        distinctUntilChanged(), // Solo realiza la consulta si el valor cambia
        switchMap(value => this.searchProducts(value || '')) // Llama a la función de búsqueda
      )
      .subscribe(products => {
        this.filteredProducts = products;
      });
  }
  calculateChangeAmount(): void {
    const paid = this.form.get('amountPaid')?.value || 0;
    const total = this.form.get('totalAmount')?.value || 0;

    const result = paid - total;

    this.changeAmount = result > 0 ? result : 0;
  }
  trackByProductId(index: number, product: Product): number {
    if (!product || !product.productId) {
      return index; // Si el producto no tiene productId, usamos el índice como fallback
    } else return 0;
  }
  searchProducts(value: string): Observable<Product[]> {
    // Si es un código de barras, devolvemos el producto dentro de un arreglo
    if (value != '') {
      if (/^\d+$/.test(value)) {
        return this.productService.getByBarCode(value).pipe(
          map(product => {
            // Si el producto se encuentra, agregamos el producto a la lista de detalles
            if (product) {
              this.filteredProducts = [product];
              this.onProductSelected(product.barCode);
              return [];
            } else {
              // Si el producto no es encontrado, retornamos un arreglo vacío o el valor que prefieras
              return [];
            }
          })
        );
      } else {
        // Si es una búsqueda por nombre, devolvemos el arreglo de productos
        return this.productService.searchByName(value);
      }
    } else {
      return new Observable<Product[]>(observer => {
        observer.next([]); // Si el valor está vacío, devolvemos un arreglo vacío
        observer.complete();
      });
    }
  }
  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  get filteredDetails(): any[] {
    return this.details.controls.map((detail: any) => detail.value);
  }

  openCashClosingModal(): void {
    const dialogRef = this.dialog.open(CashClosingModalComponent, {
      width: '400px',
      data: { totalAmount: this.form.get('totalAmount')?.value }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró', result);
    });
  }

  onProductSelected(barCode?: string): void {
    // Verificar si el producto ya está en la lista
    const selectedProduct = this.filteredProducts.find(p => p.barCode === barCode);

    if (!selectedProduct) {
      this.clearProductSearchInput();
      return;
    }

    // Verificar si el producto ya está en la lista de detalles
    const isProductAlreadyAdded =
      (this.details.controls as FormGroup[]).filter(
        (detail: FormGroup) => detail.get('productId')?.value === selectedProduct.productId
      ).length > 0;

    if (isProductAlreadyAdded) {
      this.toast.warning('Este producto ya está en la lista.');
      this.clearProductSearchInput();
      return;
    }

    this.addProductToDetails(selectedProduct);
  }

  addProductToDetails(selectedProduct: Product): void {
    // Asegúrate de que cada detalle es un FormGroup
    const productGroup = this.fb.group({
      barCode: [selectedProduct.barCode],
      name: [selectedProduct.name],
      productSearch: [selectedProduct.name],
      productId: [selectedProduct.productId, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [selectedProduct.unitPrice, [Validators.required, Validators.min(0)]],
      total: [0],
      stock: [selectedProduct.stock],
      stockSold: [selectedProduct.stockSold],
    });

    // Añadimos el FormGroup al FormArray
    this.details.push(productGroup);
    this.toast.success('Producto agregado:', selectedProduct.name);
    this.clearProductSearchInput();
  }

  dueDateAfterIssueDateValidator() {
    return (formGroup: FormGroup) => {
      const issueDate = formGroup.get('issueDate')?.value;
      const dueDate = formGroup.get('dueDate')?.value;

      if (!issueDate || !dueDate) return null;

      return new Date(dueDate) < new Date(issueDate) ? { dueBeforeIssue: true } : null;
    };
  }

  addDetailProduct(selectedProduct: Product) {
    const currentGroup = this.fb.group({
      barCode: [selectedProduct.barCode],
      name: [selectedProduct.name],
      productSearch: [selectedProduct.name], // Agregamos el nombre del producto
      productId: [selectedProduct.productId, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [selectedProduct.unitPrice, [Validators.required, Validators.min(0)]],
      stock: [selectedProduct.stock, [Validators.required, Validators.min(1)]],
      stockSold: [selectedProduct.stockSold],
    });

    // Agregamos el producto al FormArray
    this.details.push(currentGroup);
    this.toast.success('Producto agregado', selectedProduct.name);
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
    // Limpiar el valor del input de búsqueda
    this.searchControl.reset();

    // Limpiar los productos filtrados
    this.filteredProducts = [];
  }

  removeDetails(index: number): void {
    this.details.removeAt(index);
  }

  // saveInvoice(): void {
  //   if (this.form.invalid) return;
  //   if (this.details.length === 0) {
  //     this.toast.warning('Debe agregar al menos un producto a la factura');
  //     return;
  //   }

  //   const total = this.form.get('totalAmount')?.value || 0;
  //   const amountPaid = this.form.get('amountPaid')?.value || 0;
  //   const cambio = amountPaid - total;

  //   if (cambio < 0) {
  //     this.toast.error('El monto pagado es menor al total. No se puede continuar.');
  //     return;
  //   }

  //   console.log('💵 Cambio a entregar:', cambio);

  //   const invoice: Invoice = this.form.value;

  //   this.invoiceService.saveInvoice(invoice).subscribe({
  //     next: savedInvoice => {
  //       this.toast.success('Factura guardada con éxito');

  //       this.dialog.open(InvoicePosDialogComponent, {
  //         data: savedInvoice,
  //         width: '380px',
  //         maxWidth: '95vw',
  //         panelClass: 'custom-dialog-container',
  //       });

  //       this.form.reset();
  //       this.details.clear();
  //       this.form.patchValue({
  //         subtotalAmount: 0,
  //         taxAmount: 0,
  //         totalAmount: 0,
  //         status: 'Emitida',
  //         issueDate: new Date(),
  //         dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  //       });
  //     },
  //     error: err => {
  //       this.toast.error('Error al guardar factura');
  //       console.error(err);
  //     },
  //   });
  // }

  saveInvoice(): void {
    if (this.form.invalid) return;
    if (this.details.length === 0) {
      this.toast.warning('Debe agregar al menos un producto a la factura');
      return;
    }

    const invoice: Invoice = this.form.value;
    this.invoiceService.saveInvoice(invoice).subscribe({
      next: savedInvoice => {
        this.toast.success('Factura guardada con éxito');

        this.dialog.open(InvoicePosDialogComponent, {
          data: savedInvoice,
          width: '380px',
          maxWidth: '95vw',
          panelClass: 'custom-dialog-container',
        });

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

    const total = this.form.get('totalAmount')?.value || 0;

    if (method === 'Crédito' || method === 'Tranferencia' || method === 'Tarjeta') {
      this.form.patchValue({ amountPaid: total });
    }
  }

  updateTotals(): void {
    let subtotal = 0;

    this.details.controls.forEach((control: any) => {
      const value = control.value;
      subtotal += (value.unitPrice || 0) * (value.quantity || 0);
    });

    const total = subtotal;

    this.form.patchValue({
      subtotalAmount: subtotal,
      taxAmount: 0,
      totalAmount: total,
    });
  }
  updateQuantity(event: any, data: Product): void {
    const quantity = event.target.value * 1;
    const valueResulto: Product = this.form.value.details.find(
      (a: Product) => a.barCode == data.barCode
    );
    if (valueResulto != null && valueResulto.stock >= quantity) {
      valueResulto.quantity = quantity;
    } else {
      this.toast.error('La cantidad no es permitida.');
      event.target.value = valueResulto.stock;
    }
    this.updateTotals();
  }

  incrementQuantity(index: number, data: any) {
    const item = this.details.at(index);
    const cant = item.value.quantity + 1;
    const stockTotal = item.value.stock - item.value.stockSold;
    if (stockTotal >= cant) {
      data.quantity = cant;
    } else {
      this.toast.error('La cantidad no es permitida. stock maximo: ' + stockTotal);
      data.quantity = stockTotal;
    }

    this.updateTotals();
  }

  decrementQuantity(index: number) {
    const item = this.details.at(index);
    if (item.value.quantity > 1) {
      item.patchValue({ quantity: item.value.quantity - 1 });
      this.updateTotals();
    }
  }
}
