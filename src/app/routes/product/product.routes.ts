import { Routes } from '@angular/router';
import { CreateProductComponent } from './create-product/create-product.component';
import { CreateCategoryComponent } from './categories/categories.component';

export const productRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'crear-producto', component: CreateProductComponent },
      { path: 'categorias', component: CreateCategoryComponent },
    ],
  },
];
