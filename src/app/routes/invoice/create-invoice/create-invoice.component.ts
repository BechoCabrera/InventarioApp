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
import { InvoiceService } from '../invoice.service';
import {
  InvoiceCreateDto,
  InvoiceDto,
  PromotionCalculationRequest,
  PromotionCalculationResponse,
} from './models';
import { ProductDiscountsService } from 'app/routes/product/product-discounts/product-discounts.service';
import { Client, ClientService } from 'app/routes/client/client.service';
import { Product, ProductService } from 'app/routes/product/product.service';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateAdapter } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { MatDialog } from '@angular/material/dialog';
import { InvoicePosDialogComponent } from '@shared/pdf/invoice-pos-dialog/invoice-pos-dialog.component';
import { CashClosingModalComponent } from './cash-closing-modal/cash-closing-modal.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/modal/confirm-dialog/confirm-dialog.component';
import { GenericModalComponent } from '@shared/modal/generic-modal/generic-modal.component';
import { PaymentWarningModalComponent } from '@shared/modal/payment-warning-modal/payment-warning-modal.component';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';

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
    MatProgressSpinnerModule,
    LoadingOverlayComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
})
export class CreateInvoiceComponent implements OnInit, AfterViewInit {
  // invoices: InvoiceDto[] = [];
  @ViewChild('productSearch') productSearchInput!: ElementRef;
  clients: Client[] = [];
  products: Product[] = [];
  changeAmount: number = 0;
  selectedPaymentMethod = '';
  dataInvoice: any[] = [];
  private readonly toast = inject(ToastrService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly promotionService = inject(ProductDiscountsService);
  // Resumen estimado
  estimatedSubtotal: number = 0;
  estimatedTax: number = 0;
  estimatedTotal: number = 0;
  estimatedDiscount: number = 0;
  estimatedPromotion: string = '';
  loadingPromotion: boolean = false;
  form!: FormGroup;
  displayedColumns: string[] = ['barCode', 'name', 'stock', 'quantity', 'unitPrice', 'actions'];
  filteredProducts: Product[] = [];
  productSearchTimeouts: Record<number, number | ReturnType<typeof setTimeout>> = {};
  searchControl = new FormControl('');
  selectedClientId: string | null = null;
  dueDate = new Date('2026-06-26');
  isSavingInvoice = false;
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
    this.checkPaymentDeadline();
    this.cargarFacturas();
    this.form = this.fb.group({
      details: this.fb.array([]),
      clientId: [null, []],
      issueDate: [{ value: new Date(), disabled: true }, Validators.required],
      dueDate: [{ value: new Date(), disabled: true }, Validators.required],
      subtotalAmount: [0],
      taxAmount: [0],
      totalAmount: [0],
      status: ['Generado'],
      paymentMethod: [null, Validators.required],
      amountPaid: [null, [Validators.required, Validators.min(0)]],
      nameClientDraft: [{ value: null, disabled: false }, []],
      nitClientDraft: [{ value: null, disabled: false }, []],
    });

    this.form.get('amountPaid')?.valueChanges.subscribe(() => {
      const paid = this.form.get('amountPaid')?.value || 0;
      const total =  this.estimatedTotal;

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
      this.updateEstimatedSummary();
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
    const total = this.estimatedTotal || 0;

    this.changeAmount = Math.max(0, paid - total);
  }

  trackByProductId(index: number, product: Product): number {
    if (!product || !product.productId) {
      return index; // Si el producto no tiene productId, usamos el índice como fallback
    } else return 0;
  }

  searchProducts(value: string): Observable<Product[]> {
    this.checkPaymentDeadline();
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
      data: { totalAmount: this.form.get('totalAmount')?.value },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró', result);
    });
  }

  onProductSelected(barCode?: string): void {
    // Verificar si el producto ya está en los productos filtrados
    const selectedProduct = this.filteredProducts.find(p => p.barCode === barCode);

    if (!selectedProduct ) {
        this.clearProductSearchInput();
        return;
    }

    if (selectedProduct.stock - selectedProduct.stockSold <= 0) {
        this.toast.error('No hay stock disponible para este producto.');
        this.clearProductSearchInput();
        return;
    }

    // Verificar si el producto ya está en la lista de detalles
    const productControl = (this.details.controls as FormGroup[]).find(
      (detail: FormGroup) => detail.get('productId')?.value === selectedProduct.productId
    );

    if (productControl) {
      // Si el producto ya está en la lista, sumamos 1 a la cantidad
      const currentQuantity = productControl.get('quantity')?.value || 0;
      productControl.get('quantity')?.setValue(currentQuantity + 1);
      this.toast.info('Cantidad actualizada para este producto.');
    } else {
      // Si el producto no está en la lista, lo agregamos con cantidad 1
      this.addProductToDetails(selectedProduct);
    }

    this.clearProductSearchInput();
  }

  addProductToDetails(selectedProduct: Product): void {
    this.checkPaymentDeadline();
    const productGroup = this.fb.group({
      barCode: [selectedProduct.barCode],
      name: [selectedProduct.name],
      productSearch: [selectedProduct.name],
      productId: [selectedProduct.productId, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [selectedProduct.unitPrice, [Validators.required, Validators.min(0)]],
      total: [selectedProduct.unitPrice],
      stock: [selectedProduct.stock],
      stockSold: [selectedProduct.stockSold],
      estimatedDiscount: [0],
      promotionApplied: [''],
      discountPercent: [0],
      addedFromSearch: [true],
    });

    // Consultar promoción para el producto
    const promoRequest = [
      {
        productId: selectedProduct.productId,
        quantity: 1,
        unitPrice: selectedProduct.unitPrice,
      },
    ];
    this.promotionService.calculatePromotion(promoRequest).subscribe({
      next: (promoRes: any) => {
        if (promoRes && promoRes.discountAmount > 0) {
          productGroup.patchValue({
            estimatedDiscount: promoRes.discountAmount,
            promotionApplied: promoRes.promotionName || '',
            discountPercent: promoRes.percentage || 0,
          });
        }
        this.details.push(productGroup);
        this.toast.success('Producto agregado:', selectedProduct.name);
      },
      error: () => {
        if (selectedProduct.discounts && selectedProduct.discounts.length > 0) {
          productGroup.patchValue({
            estimatedDiscount:
              selectedProduct.discounts[0].percentage ||
              selectedProduct.discounts[0].discountAmount ||
              0,
            promotionApplied: selectedProduct.discounts[0].promotionName || '',
          });
        }
        this.details.push(productGroup);
        this.toast.success('Producto agregado:', selectedProduct.name);
      },
    });
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
    this.checkPaymentDeadline();
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

  cargarFacturas(): void {
    this.invoiceService.getAllInvoices().subscribe({
      next: data => {
        this.dataInvoice = data;
      },
      error: () => {
        console.error('Error cargando facturas');
      },
    });
  }

  async checkPaymentDeadlineResult(): Promise<boolean> {
    // const dueDate = new Date('2026-06-26');

    const today = new Date();
    const diffDays = Math.ceil((this.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Si faltan 5 días o menos para vencimiento
    if (diffDays <= 5 && diffDays > 0) {
      const dialogRef = this.dialog.open(PaymentWarningModalComponent, {
        width: '420px',
        disableClose: true,
        data: {
          message: `⚠️ Faltan ${diffDays} días para que se venza el servicio. Por favor realizar el pago.`,
          allowClose: true,
        },
      });

      await dialogRef.afterClosed().toPromise();
      return true;
    }

    // Si ya está vencido
    if (diffDays <= 0) {
      const dialogRef = this.dialog.open(PaymentWarningModalComponent, {
        width: '420px',
        disableClose: true,
        data: {
          message: `🚫 El servicio ha vencido. No se pueden registrar nuevas facturas.`,
          allowClose: false,
        },
      });

      await dialogRef.afterClosed().toPromise();
      return false;
    }

    return true;
  }

  async saveInvoice(): Promise<void> {
    const resultValid = await this.checkPaymentDeadlineResult();
    if (!resultValid) {
      console.warn('⛔ Guardado detenido por vencimiento del servicio');
      return;
    }
    this.cargarFacturas();
    const dataInvoice = this.dataInvoice.find(
      a => a.isCancelled && a.invoiceNumber == '2025FAC00183'
    );
    if (this.dataInvoice.length > 1000 && dataInvoice != null) {
      const dialogRef = this.dialog.open(GenericModalComponent, {
        width: '1000px', // Puedes ajustar el tamaño del modal
        data: {
          message: '',
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
        }
      });
      return;
    } else {
      if (this.form.invalid) return;

      const client: any = this.form.value;
      const invoice: InvoiceCreateDto = this.form.value;

      if (this.details.length === 0) {
        this.toast.warning('Debe agregar al menos un producto a la factura');
        return;
      }
      if (
        invoice.clientId == null &&
        (client.nameClientDraft == '' ||
          client.nitClientDraft == '' ||
          client.nameClientDraft == null ||
          client.nitClientDraft == null)
      ) {
        this.toast.warning('Debe seleccionar un cliente o ingresar los datos del cliente');
        return;
      }

      if (
        client.nameClientDraft != '' &&
        client.nitClientDraft != '' &&
        client.nameClientDraft != null &&
        client.nitClientDraft != null
      ) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: 'Guardar Cliente',
            message: '¿Desea guardar este cliente?',
          } as ConfirmDialogData,
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            const clientData: Client = {
              name: client.nameClientDraft,
              nit: client.nitClientDraft,
              email: client.email,
              phone: client.phone,
              clientId: client.clientId || null,
              entitiName: client.entitiName,
            };
            this.clientService.create(clientData).subscribe({
              next: () => {
                this.toast.success('Cliente guardado con éxito');
                this.isSavingInvoice = true;
                this.invoiceService.saveInvoice(invoice).subscribe({
                  next: savedInvoice => {
                    this.isSavingInvoice = false;
                    this.toast.success('Factura guardada');
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
                    this.isSavingInvoice = false;
                    // El interceptor global mostrará el mensaje de error del backend
                    console.error('Error al guardar factura', err);
                  },
                });
              },
              error: err => {
                // El interceptor global mostrará el mensaje de error del backend
                console.error('Error al guardar cliente', err);
              },
            });
          } else {
            this.isSavingInvoice = true;
            this.invoiceService.saveInvoice(invoice).subscribe({
              next: savedInvoice => {
                this.isSavingInvoice = false;
                this.toast.success('Factura guardada');
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
                this.isSavingInvoice = false;
                // El interceptor global mostrará el mensaje de error del backend
                console.error('Error al guardar factura', err);
              },
            });
          }
        });
      } else {
        this.isSavingInvoice = true;
        this.invoiceService.saveInvoice(invoice).subscribe({
          next: savedInvoice => {
            this.isSavingInvoice = false;
            this.toast.success('Factura guardada');
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
            this.isSavingInvoice = false;
            // El interceptor global mostrará el mensaje de error del backend
            console.error('Error al guardar factura', err);
          },
        });
      }
      return;
    }
  }

  onClientSelected(clientId: string): void {
    const client = this.clients.find(client => client.clientId === clientId);
    if (client) {
      this.form.patchValue({
        nameClientDraft: client.name,
        nitClientDraft: client.nit,
      });
      this.form.get('nameClientDraft')?.disable();
      this.form.get('nitClientDraft')?.disable();
    }
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: data => (this.clients = data),
      error: err => {
        // El interceptor global ya muestra el mensaje de error
        console.error('Error cargando clientes', err);
      },
    });
  }

  editInvoice(event: any) {}

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    this.form.patchValue({ paymentMethod: method });

    const total = this.estimatedTotal || 0;

    if (method === 'Crédito' || method === 'Transferencia' || method === 'Tarjeta') {
      this.form.patchValue({ amountPaid: total });
    }
  }

  updateEstimatedSummary(): void {
    // Calcular subtotal visual
    let subtotal = 0;
    let totalDiscount = 0;
    this.details.controls.forEach((control: any) => {
      const value = control.value;
      subtotal += (value.unitPrice || 0) * (value.quantity || 0);
      totalDiscount += value.estimatedDiscount || 0;
    });
    this.estimatedSubtotal = subtotal;
    this.estimatedDiscount = totalDiscount;
    this.estimatedTax = 0;
    this.estimatedTotal = +(subtotal + this.estimatedTax - this.estimatedDiscount).toFixed(2);

    this.form.patchValue({
      subtotalAmount: this.estimatedSubtotal,
      taxAmount: this.estimatedTax,
      totalAmount: this.estimatedTotal,
    });

    this.calculateChangeAmount();
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
    this.updateEstimatedSummary();
  }

  incrementQuantity(index: number, data: any) {
    const item = this.details.at(index);
    const cant = item.value.quantity + 1;
    const stockTotal = item.value.stock - item.value.stockSold;
    let newQuantity = cant;
    if (stockTotal < cant) {
      this.toast.error('La cantidad no es permitida. stock maximo: ' + stockTotal);
      newQuantity = stockTotal;
    }
    // Calcular descuento estimado
    const percent = item.value.discountPercent || 0;
    const unitPrice = item.value.unitPrice || 0;
    const estimatedDiscount = Math.round(unitPrice * newQuantity * percent / 100);
    item.patchValue({ quantity: newQuantity, estimatedDiscount });
    this.updateEstimatedSummary();
  }

  decrementQuantity(index: number) {
    const item = this.details.at(index);
    if (item.value.quantity > 1) {
      const newQuantity = item.value.quantity - 1;
      const percent = item.value.discountPercent || 0;
      const unitPrice = item.value.unitPrice || 0;
      const estimatedDiscount = Math.round(unitPrice * newQuantity * percent / 100);
      item.patchValue({ quantity: newQuantity, estimatedDiscount });
      this.updateEstimatedSummary();
    }
  }

  clearClient(): void {
    this.form.get('clientId')?.setValue(null);
    this.form.patchValue({
      nameClientDraft: null,
      nitClientDraft: null,
    });
    this.form.get('nameClientDraft')?.enable();
    this.form.get('nitClientDraft')?.enable();
  }

  checkPaymentDeadline(): void {
    const today = new Date();

    const diffDays = Math.ceil((this.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Si la fecha ya pasó → mostrar alerta permanente sin cerrar
    if (diffDays <= 0) {
      this.dialog.open(PaymentWarningModalComponent, {
        width: '420px',
        disableClose: true,
        data: {
          message: `El servicio ha vencido. No puede cerrarse hasta renovar.`,
          allowClose: false,
        },
      });
    }
  }
}
