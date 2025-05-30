import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'cliente', component: crearclienteComponent }, // Asegúrate de que el componente esté importado correctamente

      // Agrega aquí más rutas si las necesitas
    ],
  },
];
