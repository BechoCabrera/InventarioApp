import { Routes } from '@angular/router';
import { CreateUserComponent } from './create-user/create-user.component';

export const userRoutes: Routes = [
  {
    path: '',
    children: [{ path: 'crear-usuario', component: CreateUserComponent }],
  },
];
