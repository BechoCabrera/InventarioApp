import { Routes } from '@angular/router';
import { CreateProductComponent } from './create-product/create-product.component';
import { CreateCategoryComponent } from './categories/categories.component';
import { CreateClientComponent } from '../client/client.component';

export const productRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'crear-producto', component: CreateProductComponent },
      { path: 'categorias', component: CreateCategoryComponent }, // ✅ Esta línea es crucial
      // Agrega aquí más rutas si las necesitas
    ],
  },
];
