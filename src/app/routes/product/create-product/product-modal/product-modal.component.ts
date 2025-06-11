import { Component, Inject, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../category.service';
import { Product, ProductService } from '../../product.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
})
export class ProductModalComponent implements OnInit {
  private readonly toast = inject(ToastrService);
  form!: FormGroup;
  product: Product;
  dataCategory: Category[] = [];

  @Output() productUpdated = new EventEmitter<Product>(); // Output para emitir el producto actualizado

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<ProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.product = data.product;
  }

  ngOnInit(): void {
    this.setCategoryData();
    this.form = this.fb.group({
      name: [this.product.name, Validators.required],
      unitPrice: [this.product.unitPrice, [Validators.required, Validators.min(0)]],
      description: [this.product.description, Validators.required],
      stock: [
        this.product.stock - this.product.stockSold,
        [Validators.required, Validators.min(0)],
      ],
      categoryId: [this.product.categoryId],
      isActive: [this.product.isActive],
    });
  }

  setCategoryData(): void {
    this.categoryService.getAll().subscribe(data => {
      this.dataCategory = data;
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const updatedProduct: Product = { ...this.product, ...this.form.value };

      this.productService.updateProduct(updatedProduct.productId, updatedProduct).subscribe({
        next: (data: any) => {
          if (data.message == 'True') {
            this.toast.success('Actualización exitosa');
            this.productUpdated.emit(updatedProduct); // Emitir el producto actualizado
            this.dialogRef.close(updatedProduct);
          } else {
            this.toast.error('No se pudo actualizar el producto');
          }
        },
        error: (error: any) => {
          console.error('Error al actualizar el producto:', error);
          this.toast.error('Error al actualizar el producto');
        },
      });
    } else {
      this.toast.error('Por favor, completa todos los campos correctamente.');
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
