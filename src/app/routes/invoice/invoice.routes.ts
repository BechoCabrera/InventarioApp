import { Routes } from '@angular/router';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';
import { InvoiceCancellationComponent } from './invoice-cancellation/invoice-cancellation.component';

export const invoiceRoutes: Routes = [
  {
    path: '',
    children: [
      { path: 'crear-factura', component: CreateInvoiceComponent }, // Asegúrate de que el componente esté importado correctamente
      { path: 'historial-factura', component: InvoiceHistoryComponent }, // Asegúrate de que el componente esté importado correctamente
      { path: 'cancelacion-factura', component: InvoiceCancellationComponent }, // Asegúrate de que el componente esté importado correctamente

      // Agrega aquí más rutas si las necesitas
    ],
  },
];
