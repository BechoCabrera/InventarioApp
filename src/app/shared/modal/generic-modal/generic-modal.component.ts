import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';  // Importa el módulo necesario
import { MatButtonModule } from '@angular/material/button';    // Si también usas botones
import { MatFormFieldModule } from '@angular/material/form-field';  // Para formularios si es necesario
import { MatInputModule } from '@angular/material/input'; // Para inputs si es necesario
import { MatIconModule } from '@angular/material/icon';  // Si usas íconos
@Component({
  selector: 'app-generic-modal',
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss'],
  imports: [ MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,],
})
export class GenericModalComponent {
selectedPlan: any;

  // Datos de los planes
  plans = {
    basic: {
      name: 'Plan Básico',
      features: [
        '1 Usuario',
        'Acceso a funcionalidades básicas',
        'Soporte limitado',
      ]
    },
    premium: {
      name: 'Plan Premium',
      features: [
        'Hasta 5 Usuarios',
        'Acceso a todas las funcionalidades',
        'Soporte 24/7',
        'Analítica avanzada',
      ]
    },
    pro: {
      name: 'Plan Pro',
      features: [
        'Usuarios ilimitados',
        'Acceso a todas las funcionalidades',
        'Soporte 24/7 con asesoría personalizada',
        'Analítica avanzada',
        'Integraciones personalizadas',
      ]
    }
  };

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

   selectPlan(planType: string): void {
    this.selectedPlan = null;
  }
}
