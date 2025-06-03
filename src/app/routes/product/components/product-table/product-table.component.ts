import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product, ProductService } from '../../product.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    CommonModule,
    MtxGridModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './product-table.component.html',
})
export class ProductTableComponent implements OnInit {
  products: Product[] = [];

  columns: MtxGridColumn[] = [
    { header: 'Nombre', field: 'name' },
    { header: 'Descripción', field: 'description' },
    { header: 'Precio', field: 'price', type: 'number', width: '100px' },
    { header: 'Stock', field: 'stock', type: 'number', width: '80px' },
    { header: 'Categoría', field: 'categoryName' },
    { header: 'Usuario', field: 'username' },
    {
      header: 'Estado',
      field: 'isActive',
      type: 'tag',
      tag: {
        true: { text: 'Activo', color: 'green' },
        false: { text: 'Inactivo', color: 'red' },
      },
    },
    {
      header: 'Acciones',
      field: 'actions',
      type: 'button',
      buttons: [
        {
          icon: 'edit',
          type: 'icon',
          color: 'primary',
          tooltip: 'Editar',
          //onClick: (record: Product) => this.editProduct(record),
        },
        {
          icon: 'delete',
          type: 'icon',
          color: 'warn',
          tooltip: 'Eliminar',
          // onClick: (record: Product) => this.deleteProduct(record),
        },
      ],
    },
  ];

  constructor(
    private productService: ProductService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }
  toggleEstado(arg: any) {}
  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: data => (this.products = data),
      error: err => {
        this.toast.error('Error al cargar productos', 'Error');
        console.error(err);
      },
    });
  }

  editProduct(product: Product): void {
    this.toast.info(`Editar producto: ${product.name}`);
  }

  deleteProduct(product: Product): void {
    this.toast.warning(`Eliminar producto: ${product.name}`);
  }
}
