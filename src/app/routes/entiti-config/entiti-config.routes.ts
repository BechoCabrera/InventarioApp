import { Routes } from '@angular/router';
import { EntitiConfigEditComponent } from './entiti-config-edit/entiti-config-edit.component';

export const entitiConfigRoutes: Routes = [
  {
    path: '',
    children: [{ path: 'crear-entidad', component: EntitiConfigEditComponent }],
  },
];
