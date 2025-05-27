import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Product, ProductService } from '../product.service';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { TokenService } from '@core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
})
export class CreateProductComponent {
  form: FormGroup;
  protected readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // Ejemplo: 'https://localhost:7027/api'
  private readonly tokenService = inject(TokenService);
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      isActive: [true],
    });
  }
  onSubmit(): void {
    if (this.form.valid) {
      this.productService.create(this.form.value).subscribe({
        next: () => {
          this.router.navigate(['/productos']);
        },
        error: err => {
          console.error(err);
        },
      });
    }
  }
}
