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
  ],
})
export class CreateProductComponent implements OnInit {
  form!: FormGroup;
  products: Product[] = [];
  displayedColumns: string[] = [
    'name',
    'description',
    'price',
    'stock',
    'category',
    'username',
    'isActive',
    'actions',
  ];

  private readonly toast = inject(ToastrService);
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}
  dataCategory: Category[] = [];
  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.maxLength(200)],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      isActive: [true],
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
        this.products = data;
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
  editProduct(product: Product): void {}
  deleteProduct(product: Product): void {}
  cancel(): void {
    this.form.reset({ isActive: true });
  }

  toggleEstado(element: Product): void {
    const estadoOriginal = element.isActive;
    const updatedProduct = { ...element, isActive: !element.isActive };
    this.productService.update(element.productId!, updatedProduct.isActive).subscribe({
      next: () => {
        this.toast.success(
          `Producto ${updatedProduct.isActive ? 'activado' : 'desactivado'} correctamente`
        );
        // Actualizar el estado del producto en la lista
        element.isActive = !element.isActive;
      },
      error: err => {
        console.error('Error al actualizar estado:', err);
        element.isActive = estadoOriginal;
      },
    });
  }
}
