import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
// import { ProductFormComponent } from '../product-form/product-form.component';
// import { ProductTableComponent } from '../product-table/product-table.component';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule],
  templateUrl: './product-page.component.html',
})
export class ProductPageComponent {
  reloadTable() {
    // lógica para recargar datos si se desea comunicar con tabla
  }
}
