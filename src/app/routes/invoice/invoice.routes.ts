import { Routes } from '@angular/router';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';


export const invoiceRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'crear-factura', component: CreateInvoiceComponent }, // Asegúrate de que el componente esté importado correctamente

      // Agrega aquí más rutas si las necesitas
    ],
  },
];
