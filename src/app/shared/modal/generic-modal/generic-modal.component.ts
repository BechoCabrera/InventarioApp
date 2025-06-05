import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-generic-modal',
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss'],
  imports: [],
})
export class GenericModalComponent {
  // Recibimos el mensaje a mostrar desde el servicio
  constructor(
    public dialogRef: MatDialogRef<GenericModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  // Al hacer clic en "No", cerramos el modal y retornamos false
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  // Al hacer clic en "Sí", cerramos el modal y retornamos true
  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
