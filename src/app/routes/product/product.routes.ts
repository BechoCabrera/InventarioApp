import { Routes } from '@angular/router';
import { CreateProductComponent } from './create-product/create-product.component';

export const productRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'crear-producto', component: CreateProductComponent },
      // Agrega aquí más rutas si las necesitas
    ],
  },
];
