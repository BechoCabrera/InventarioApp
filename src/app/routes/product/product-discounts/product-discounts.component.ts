import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { ProductService, Product } from '../product.service';
import { ToastrService } from 'ngx-toastr';
import { ProductDiscountsService } from './product-discounts.service';
import { DateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
import { ViewChild, AfterViewInit } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-product-discounts',
  standalone: true,
  providers: [{ provide: LOCALE_ID, useValue: 'es-CO' }],
  templateUrl: './product-discounts.component.html',
  styleUrls: ['./product-discounts.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    LoadingOverlayComponent,
    MatSortModule
  ],
})
export class ProductDiscountsComponent implements OnInit, AfterViewInit {
  cancelEdit() {
    this.editingPromotion = null;
    this.form.reset({
      isActive: true,
      type: '1', // Siempre '1' o '2', nunca 'Percentage'
      productIds: [],
      startDate: new Date(),
      endDate: new Date(),
    });
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }
  promotionsTbl: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatSort) sort!: MatSort;

  form!: FormGroup;
  products: Product[] = [];
  loading = false;
  displayedColumns: string[] = [
    'name',
    'type',
    'percentage',
    'minQuantity',
    'startDate',
    'endDate',
    'isActive',
    'productIds',
    'actions',
  ];
  /** Devuelve los nombres de los productos incluidos en la promoción */
  getProductNames(productIds: any[]): string {
    if (!productIds || !productIds.length) return '-';
    return productIds
      .map(id => {
        const prod = this.products.find(p => p.productId === id);
        return prod ? prod.name : id;
      })
      .join(', ');
  }
  editingPromotion: any = null;

  private readonly productDiscountsService = inject(ProductDiscountsService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastrService);
  private dateAdapter = inject(DateAdapter);

  constructor() {
    this.dateAdapter.setLocale('es-CO');
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      type: new FormControl('1', Validators.required),
      discountValue: new FormControl(null),
      percentage: new FormControl(null),
      minQuantity: new FormControl(null),
      isActive: new FormControl(true),
      productIds: new FormControl([], Validators.required),
      startDate: new FormControl<Date | null>(new Date(), Validators.required),
      endDate: new FormControl<Date | null>(new Date(), Validators.required),
    });
    this.form.get('type')?.valueChanges.subscribe(type => {
      if (type === '1') {
        this.form
          .get('percentage')
          ?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        this.form.get('discountValue')?.clearValidators();
        this.form.get('minQuantity')?.clearValidators();
      } else if (type === '2') {
        this.form
          .get('percentage')
          ?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        this.form.get('discountValue')?.clearValidators();
        this.form.get('minQuantity')?.setValidators([Validators.required, Validators.min(1)]);
      }
      this.form.get('percentage')?.updateValueAndValidity();
      this.form.get('discountValue')?.updateValueAndValidity();
      this.form.get('minQuantity')?.updateValueAndValidity();
    });
    this.loadProducts();
    this.loadPromotions();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: products => {
        this.products = products;
        this.loading = false;
      },
      error: err => {
        // El interceptor global mostrará el mensaje de error del backend
        console.error('Error cargando productos', err);
        this.loading = false;
      },
    });
  }

  savePromotion() {
    if (this.form.invalid) {
      this.toast.warning('Completa todos los campos obligatorios');
      return;
    }
    this.loading = true;
    // Construir DTO con Products y ProductIds
    const productIds = this.form.value.productIds || [];
    const dto = {
      ...this.form.value,
      type: Number(this.form.value.type),
      productIds,
      Products: productIds.map((id: string) => ({ ProductId: id })),
    };
    if (this.editingPromotion) {
      // Actualizar promoción existente
      this.productDiscountsService
        .updatePromotion(this.editingPromotion.id || this.editingPromotion.promotionId, dto)
        .subscribe({
          next: () => {
            this.toast.success('Promoción actualizada correctamente');
            this.form.reset({
              isActive: true,
              type: '1', // Siempre '1' o '2', nunca 'Percentage'
              productIds: [],
              startDate: new Date(),
              endDate: new Date(),
            });
            this.editingPromotion = null;
            this.loadPromotions();
            this.loading = false;
          },
          error: err => {
            // El interceptor global mostrará el mensaje de error del backend
            console.error('Error al actualizar la promoción', err);
            this.loading = false;
          },
        });
    } else {
      // Crear nueva promoción
      this.productDiscountsService.createPromotion(dto).subscribe({
        next: () => {
          this.toast.success('Promoción guardada correctamente');
          this.form.reset({
            isActive: true,
            type: '1', // Siempre '1' o '2', nunca 'Percentage'
            productIds: [],
            startDate: new Date(),
            endDate: new Date(),
          });
          this.loadPromotions();
          this.loading = false;
        },
        error: err => {
          // El interceptor global mostrará el mensaje de error del backend
          console.error('Error al guardar la promoción', err);
          this.loading = false;
        },
      });
    }
  }

  loadPromotions() {
    this.loading = true;
    this.productDiscountsService.getPromotions().subscribe({
      next: promos => {
        this.promotionsTbl = promos;
        this.dataSource.data = promos;
        this.loading = false;
      },
      error: err => {
        // El interceptor global mostrará el mensaje de error del backend
        console.error('Error cargando promociones', err);
        this.loading = false;
      },
    });
  }

  editPromotion(promo: any) {
    this.loading = true;
    this.productDiscountsService.getPromotionById(promo.id || promo.promotionId).subscribe({
      next: promotion => {
        this.editingPromotion = promotion;
        // Asegurarse que type sea string '1' o '2'
        let typeValue = promotion.type ?? promotion.discountType;
        if (typeof typeValue === 'number') typeValue = typeValue.toString();
        if (typeValue === 'Percentage') typeValue = '1';
        if (typeValue === 'Fixed') typeValue = '2';
        this.form.patchValue({
          name: promotion.name,
          type: typeValue,
          discountValue: promotion.discountValue ?? null,
          percentage: promotion.percentage ?? null,
          minQuantity: promotion.minQuantity ?? null,
          isActive: promotion.isActive,
          productIds: Array.isArray(promotion.productIds) ? promotion.productIds : [],
          startDate: promotion.startDate ? new Date(promotion.startDate) : null,
          endDate: promotion.endDate ? new Date(promotion.endDate) : null,
        });
        // Forzar validación y actualización de campos condicionales
        this.form.get('type')?.updateValueAndValidity();
        this.form.get('percentage')?.updateValueAndValidity();
        this.form.get('discountValue')?.updateValueAndValidity();
        this.form.get('minQuantity')?.updateValueAndValidity();
        this.loading = false;
      },
      error: err => {
        // El interceptor global mostrará el mensaje de error del backend
        console.error('Error cargando la promoción', err);
        this.loading = false;
      },
    });
  }

  /** Cambia el estado de la promoción a inactivo si el usuario confirma */
  togglePromotionStatus(promo: any) {
    const nuevoEstado = promo.isActive ? 'inactivo' : 'activo';
    if (confirm(`¿Quieres cambiar el estado a ${nuevoEstado} de esta promoción?`)) {
      this.loading = true;
      this.productDiscountsService.togglePromotionStatus(promo.id || promo.promotionId).subscribe({
        next: () => {
          this.toast.success(`Estado cambiado a ${nuevoEstado}`);
          this.loadPromotions();
          this.loading = false;
        },
        error: err => {
          // El interceptor global mostrará el mensaje de error del backend
          console.error('No se pudo cambiar el estado', err);
          this.loading = false;
        },
      });
    }
  }

  deletePromotion(promo: any) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta promoción?')) {
      return;
    }
    this.loading = true;
    this.productDiscountsService.deletePromotion(promo.id || promo.promotionId).subscribe({
      next: () => {
        this.toast.success('Promoción eliminada');
        this.loadPromotions();
        this.loading = false;
      },
      error: err => {
        // El interceptor global mostrará el mensaje de error del backend
        console.error('Error al eliminar la promoción', err);
        this.loading = false;
      },
    });
  }
}
