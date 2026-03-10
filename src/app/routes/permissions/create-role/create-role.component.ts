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
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Permission, PermissionsAdminService, Role } from '../permissions-admin.service';

@Component({
  selector: 'app-create-role',
  standalone: true,
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
  ],
})
export class CreateRoleComponent implements OnInit {
  form!: FormGroup;
  roles: Role[] = [];
  displayedColumns: string[] = ['roleName', 'description', 'actions'];
  isLoading = true;
  editingRole: Role | null = null;
  permissions: Permission[] = [];
  private readonly toast = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private permissionsService: PermissionsAdminService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      roleName: [null, Validators.required],
      description: [null],
      permissionIds: [[]],
    });

    this.loadPermissions();
    this.loadRoles();
  }

  loadPermissions(): void {
    this.permissionsService.getPermissions().subscribe({
      next: data => {
        this.permissions = data;
      },
      error: err => {
        console.error('Error al cargar permisos', err);
      },
    });
  }

  loadRoles(): void {
    this.isLoading = true;
    this.permissionsService.getRoles().subscribe({
      next: data => {
        this.roles = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al cargar roles', err);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const role: Partial<Role> = {
      roleName: this.form.value.roleName,
      description: this.form.value.description,
      permissionIds: this.form.value.permissionIds,
    };
    const request$ = this.editingRole?.roleId
      ? this.permissionsService.updateRole(this.editingRole.roleId, role)
      : this.permissionsService.createRole(role);

    request$.subscribe({
      next: () => {
        this.toast.success(this.editingRole ? 'Rol actualizado con éxito' : 'Rol creado con éxito');
        this.form.reset();
        this.editingRole = null;
        this.loadRoles();
      },
      error: err => {
        console.error('No se pudo guardar el rol', err);
      },
    });
  }

  editRole(role: Role): void {
    this.editingRole = role;
    this.form.patchValue({
      roleName: role.roleName,
      description: role.description ?? null,
      permissionIds: role.permissionIds ?? [],
    });
  }

  deleteRole(role: Role): void {
    if (!role.roleId) {
      return;
    }

    const confirmed = confirm(`¿Está seguro que desea eliminar el rol "${role.roleName}"?`);
    if (!confirmed) {
      return;
    }

    this.isLoading = true;
    this.permissionsService.deleteRole(role.roleId).subscribe({
      next: () => {
        this.toast.success('Rol eliminado con éxito');
        this.loadRoles();
      },
      error: err => {
        console.error('No se pudo eliminar el rol', err);
        this.isLoading = false;
      },
    });
  }

  clearForm(): void {
    this.form.reset({
      roleName: null,
      description: null,
      permissionIds: [],
    });
    this.editingRole = null;
  }
}
