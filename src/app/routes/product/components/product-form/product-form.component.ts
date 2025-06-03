import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Category, CategoryService } from '../../category.service';
import { ProductService } from '../../product.service';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  dataCategory: Category[] = [];
  @Output() onSaved = new EventEmitter<void>();

  private readonly toast = inject(ToastrService);
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.maxLength(200)],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      isActive: [true],
    });
    this.setCatedoryData();
  }

  setCatedoryData(): void {
    this.categoryService.getAll().subscribe(data => (this.dataCategory = data));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const formValue = { ...this.form.value };
    if (formValue.categoryId === '') formValue.categoryId = null;
    this.productService.create(formValue).subscribe({
      next: () => {
        this.toast.success('Producto guardado con éxito');
        this.form.reset({ isActive: true });
        this.onSaved.emit();
      },
      error: err => {
        console.error('Error creating product', err);
        this.toast.error('Producto no guardado');
      },
    });
  }
  cancel(): void {
    this.form.reset({ isActive: true });
  }
}
