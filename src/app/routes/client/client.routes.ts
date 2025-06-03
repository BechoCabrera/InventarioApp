import { Routes } from '@angular/router';
import { CreateClientComponent } from './create-client/create-client.component';

export const clientRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'crear-cliente', component: CreateClientComponent }, // Asegúrate de que el componente esté importado correctamente

      // Agrega aquí más rutas si las necesitas
    ],
  },
];
