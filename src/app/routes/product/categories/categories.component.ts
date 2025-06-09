import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Category, CategoryService } from '../category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
  ],
})
export class CreateCategoryComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  displayedColumns: string[] = ['name', 'description', 'entitiName', 'actions'];

  private readonly toast = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.maxLength(200)],
    });
    this.clear();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data: Category[]) => (this.categories = data),
      error: (err: any) => {
        this.toast.error('Error al cargar categorías', 'Error');
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue: Category = { ...this.form.value };
    this.categoryService.create(formValue).subscribe({
      next: () => {
        this.toast.success('Categoría guardada con éxito');
        this.form.reset();
        this.loadCategories();
      },
      error: (err: any) => {
        console.error('Error creando categoría', err);
        this.toast.error('Categoría no guardada');
      },
    });
  }

  editCategory(category: Category): void {
    this.form.patchValue(category);
  }

  deleteCategory(category: Category): void {
    // Implementación opcional
  }

  clear(): void {
    this.form.reset();
  }
}
