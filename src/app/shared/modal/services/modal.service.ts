import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';
('');
@Injectable({
  providedIn: 'root', // Esto hace que el servicio esté disponible globalmente
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  // Método para abrir el modal y pasar un mensaje dinámico
  openModal(message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(GenericModalComponent, {
      data: { message }, // Pasamos el mensaje dinámico al modal
    });

    // Retornamos una promesa para que podamos manejar el resultado de forma asincrónica
    return dialogRef.afterClosed().toPromise();
  }
}
