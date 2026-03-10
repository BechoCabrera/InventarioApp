import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Client, ClientService } from '../client.service';
import { ClientModalComponent } from './client-modal/client-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
@Component({
  selector: 'app-create-client',
  standalone: true,
  templateUrl: './create-client.component.html',
  styleUrl: './create-client.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
    LoadingOverlayComponent,
  ],
})
export class CreateClientComponent implements OnInit {
  form!: FormGroup;
  clients: Client[] = [];
  displayedColumns: string[] = ['name', 'nit', 'email', 'phone', 'entitiName', 'actions'];
  isEntitiLoading = true;
  private readonly toast = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      nit: [null, Validators.required],
      email: [null, []],
      phone: [null, []],
    });
    this.clear();
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: data => {
        this.clients = data;
        this.isEntitiLoading = false;
      },
      error: err => {
        // El interceptor global mostrará el mensaje de error del backend
        console.error('Error al cargar clientes', err);
        this.isEntitiLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const client: Client = { ...this.form.value };
    this.clientService.create(client).subscribe({
      next: () => {
        this.toast.success('Cliente registrado con éxito');
        this.clear();
        this.loadClients();
      },
      error: err => {
        // El interceptor global mostrará el mensaje de error del backend
        console.error('No se pudo registrar el cliente', err);
      },
    });
  }

  editClient(client: Client): void {
    const dialogRef = this.dialog.open(ClientModalComponent, {
      width: '500px',
      data: { client: client }, // Pasa el cliente al modal
    });

    dialogRef.componentInstance.clientUpdated.subscribe((updatedClient: Client) => {
      // Cuando se recibe el cliente actualizado desde el modal
      const index = this.clients.findIndex(c => c.clientId === updatedClient.clientId);
      if (index !== -1) {
        this.loadClients(); // Recarga la lista de clientes
      }
    });
  }

  deleteClient(client: Client): void {
    if (!client.clientId) {
      return;
    }

    const confirmed = confirm(`¿Está seguro que desea eliminar al cliente "${client.name}"?`);
    if (!confirmed) {
      return;
    }

    this.clientService.delete(client.clientId).subscribe({
      next: () => {
        this.toast.success('Cliente eliminado con éxito');
        this.loadClients();
      },
      error: err => {
        console.error('No se pudo eliminar el cliente', err);
      },
    });
  }

  clear(): void {
    this.form.reset();
  }
}
