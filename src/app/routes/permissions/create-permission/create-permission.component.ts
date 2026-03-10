import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { Permission, PermissionsAdminService } from '../permissions-admin.service';

@Component({
  selector: 'app-create-permission',
  standalone: true,
  templateUrl: './create-permission.component.html',
  styleUrl: './create-permission.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule
  ],
})
export class CreatePermissionComponent implements OnInit {
  form!: FormGroup;
  permissions: Permission[] = [];
  displayedColumns: string[] = ['permissionName', 'description', 'actions'];
  isLoading = true;
  editingPermission: Permission | null = null;
  private readonly toast = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private permissionsService: PermissionsAdminService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      permissionName: [null, Validators.required],
      description: [null],
    });

    this.loadPermissions();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.permissionsService.getPermissions().subscribe({
      next: data => {
        this.permissions = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al cargar permisos', err);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const permission: Partial<Permission> = {
      permissionName: this.form.value.permissionName,
      description: this.form.value.description,
    };
    const request$ = this.editingPermission?.permissionId
      ? this.permissionsService.updatePermission(this.editingPermission.permissionId, permission)
      : this.permissionsService.createPermission(permission);

    request$.subscribe({
      next: () => {
        this.toast.success(this.editingPermission ? 'Permiso actualizado con éxito' : 'Permiso creado con éxito');
        this.form.reset();
        this.editingPermission = null;
        this.loadPermissions();
      },
      error: err => {
        console.error('No se pudo guardar el permiso', err);
      },
    });
  }

  editPermission(permission: Permission): void {
    this.editingPermission = permission;
    this.form.patchValue({
      permissionName: permission.permissionName,
      description: permission.description ?? null,
    });
  }

  deletePermission(permission: Permission): void {
    if (!permission.permissionId) {
      return;
    }

    const confirmed = confirm(`¿Está seguro que desea eliminar el permiso "${permission.permissionName}"?`);
    if (!confirmed) {
      return;
    }

    this.isLoading = true;
    this.permissionsService.deletePermission(permission.permissionId).subscribe({
      next: () => {
        this.toast.success('Permiso eliminado con éxito');
        this.loadPermissions();
      },
      error: err => {
        console.error('No se pudo eliminar el permiso', err);
        this.isLoading = false;
      },
    });
  }

  clearForm(): void {
    this.form.reset({
      permissionName: null,
      description: null,
    });
    this.editingPermission = null;
  }
}
