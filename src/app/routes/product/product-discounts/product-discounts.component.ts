import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-discounts',
  standalone: true,
  template: `
    <mat-card>
      <h2>Descuentos de productos</h2>
      <mat-divider></mat-divider>

      <div class="content">
        <mat-icon>local_offer</mat-icon>
        <p>Este módulo está listo para implementar la creación y gestión de descuentos.</p>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .content {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
      }
    `,
  ],
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule],
})
export class ProductDiscountsComponent {}
