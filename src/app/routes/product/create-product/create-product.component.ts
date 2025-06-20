import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Component, inject, OnInit } from '@angular/core';
import { Product, ProductService } from '../product.service';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Category, CategoryService } from '../category.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/modal/confirm-dialog/confirm-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { StockAdjustmentModalComponent } from './stock-adjustment-modal/stock-adjustment-modal.component';

import { ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ProductSummaryComponent } from '../product-summary/product-summary.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
@Component({
  selector: 'app-create-product',
  standalone: true,
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    LoadingOverlayComponent,
    MatPaginatorModule,
    MatSortModule,
  ],
})
export class CreateProductComponent implements OnInit {
  totalProductos = 0;
  totalStock = 0;
  totalValorInventario = 0;
  totalVentas = 0;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  form!: FormGroup;
  products = new MatTableDataSource<Product>();
  isEntitiLoading = true;
  displayedColumns: string[] = [
    'barCode',
    'name',
    'description',
    'unitPrice',
    'stock',
    'stockSold',
    'category',
    'username',
    'entitiName',
    'isActive',
    'actions',
  ];
  private calcularTotales(): void {
    const totalValorInventario = this.products.data.reduce(
      (acc, p) => acc + (p.stock - p.stockSold) * p.unitPrice,
      0
    );

    this.totalProductos = this.products.data.length;
    this.totalStock = this.products.data.reduce((acc, p) => acc + (p.stock - p.stockSold), 0);


    this.totalVentas = this.products.data.reduce(
      (acc, p) => acc + p.unitPrice * p.stockSold, 0
    );

    this.totalValorInventario = totalValorInventario - this.totalVentas;
  }

  private readonly toast = inject(ToastrService);
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}
  dataCategory: Category[] = [];
  ngOnInit(): void {
    this.form = this.fb.group({
      barCode: [null, Validators.required],
      name: [null, Validators.required],
      description: [null, Validators.maxLength(200)],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, []],
      isActive: [true, []],
    });

    this.loadProducts();
    this.setCatedoryData();
  }

  openSummaryModal(): void {
    this.dialog.open(ProductSummaryComponent, {
      width: '700px',
      data: {
        totalProductos: this.totalProductos,
        totalStock: this.totalStock,
        totalValorInventario: this.totalValorInventario,
        products: this.products.data.map(p => ({
          name: p.name,
          stock: p.stock - p.stockSold,
        })),
      },
    });
  }

  setCatedoryData(): void {
    this.categoryService.getAll().subscribe(data => (this.dataCategory = data));
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: data => {
        this.products.data = data;
        this.products.sort = this.sort;
        this.products.paginator = this.paginator;

        this.sort.active = 'name';
        this.sort.direction = 'asc';
        this.sort.sortChange.emit({ active: 'name', direction: 'asc' });

        this.isEntitiLoading = false;
        this.calcularTotales();
      },
      error: err => {
        this.toast.error('Error al cargar productos', 'Error');
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const formValue = { ...this.form.value };
    if (formValue.categoryId === '') {
      formValue.categoryId = null;
    }
    this.productService.create(formValue).subscribe({
      next: () => {
        this.toast.success('Producto guardado con éxito');
        this.form.reset({ isActive: true });
        this.loadProducts();
      },
      error: err => {
        console.error('Error creating product', err);
        this.toast.error('Producto no guardado');
      },
    });
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '500px',
      data: { product }, // Pasa el producto al modal
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar producto',
        message: `¿Estás seguro de que deseas eliminar el producto "${product.name}"?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.delete(product.productId).subscribe({
          next: value => {
            if (value.message == 'True') {
              this.toast.success(`Producto ${product.name} eliminado correctamente`);
              this.loadProducts();
            } else {
              this.toast.error('Producto no eliminado, este producto tiene ventas asociadas');
            }
          },
          error: err => {
            this.toast.error('Producto no eliminado');
          },
        });
      }
    });
  }
  cancel(): void {
    this.form.reset({ isActive: true });
  }

  openStockAdjustmentModal(product: any, action: 'increase' | 'decrease'): void {
    const dialogRef = this.dialog.open(StockAdjustmentModalComponent, {
      width: '300px',
      data: { action, product },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const quantity = result.quantity;
        if (result.action === 'increase') {
          this.increaseStock(product.productId, quantity);
        } else {
          this.decreaseStock(product.productId, quantity);
        }
      }
    });
  }

  increaseStock(productId: string, quantity: number): void {
    this.productService.increaseStock(productId, quantity).subscribe(
      updatedProduct => {
        this.toast.success('Stock aumentado correctamente.');
        this.loadProducts();
        this.calcularTotales();
      },
      error => {
        this.toast.error('Error al aumentar el stock.');
        console.error(error);
      }
    );
  }

  decreaseStock(productId: string, quantity: number): void {
    this.productService.decreaseStock(productId, quantity).subscribe(
      updatedProduct => {
        this.toast.success('Stock reducido correctamente.');
        this.loadProducts();
        this.calcularTotales();
      },
      error => {
        this.toast.error('Error al reducir el stock.' + error.error);
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.products.filter = filterValue;
    if (this.products.filter.trim().length > 0) {
      this.products.filterPredicate = (data: Product, filter: string) => {
        return data.name.toLowerCase().includes(filter); // Filtra por nombre
      };
    }
  }
}
