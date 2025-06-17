import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Client, ClientService } from '../../client.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-client-modal',
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatLabel,
    MatSelectModule,
    MatOptionModule,
  ],
})
export class ClientModalComponent {
  form!: FormGroup;
  @Output() clientUpdated = new EventEmitter<Client>(); // Evento para emitir el cliente actualizado

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private dialogRef: MatDialogRef<ClientModalComponent>,
    private clientService: ClientService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.form = this.fb.group({
      name: [data.client.name, Validators.required],
      nit: [data.client.nit, Validators.required],
      email: [data.client.email, [Validators.required, Validators.email]],
      phone: [data.client.phone, Validators.required],
    });
  }

  onSubmit() {
  if (this.form.valid) {
    const updatedClient: Client = { ...this.data.client, ...this.form.value };
    this.clientService.updateClient(updatedClient.clientId!, updatedClient).subscribe({
      next: (data) => {
        if (data.message == 'True') {
          // Si el backend responde con éxito
          this.toast.success("Cliente Actualizado");  // El mensaje del backend (e.g., "Actualización exitosa")
          this.clientUpdated.emit(updatedClient);
          this.dialogRef.close();  // Cierra el modal
        } else {
          // Si el mensaje del backend es "No se pudo actualizar el cliente"
          this.toast.error('No se pudo actualizar el cliente');
        }
      },
      error: () => {
        this.toast.error('No se pudo actualizar el cliente');
        this.dialogRef.close();
      },
    });
  } else {
    this.toast.error('Por favor, completa todos los campos correctamente');
  }
}

  onCancel() {
    this.dialogRef.close();
  }
}
