import { Routes } from '@angular/router';
import { CashClosingHistoryComponent } from './cash-closing-history/cash-closing-history.component';


export const cashClosing: Routes = [
  {
    path: '',
    children: [
      { path: 'cierre-caja', component: CashClosingHistoryComponent },
      // Agrega aquí más rutas si las necesitas
    ],
  },
];
