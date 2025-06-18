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

import { ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


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
    MatPaginatorModule
  ],
})
export class CreateProductComponent implements OnInit {
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
      categoryId: [null,[]],
      isActive: [true,[]],
    });

    this.loadProducts();
    this.setCatedoryData();
  }

  setCatedoryData(): void {
    this.categoryService.getAll().subscribe(data => (this.dataCategory = data));
  }

  loadProducts(): void {
  this.productService.getAll().subscribe({
    next: data => {
      this.products.data = data;
      this.products.paginator = this.paginator;
      this.isEntitiLoading = false;
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
        // Solo eliminar si el usuario confirmó
        this.productService.delete(product.productId).subscribe({
          next: value => {
            if (value.message == 'True') {
              this.toast.success(`Producto ${product.name} eliminado correctamente`);
              this.loadProducts();
            }else{
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
}
