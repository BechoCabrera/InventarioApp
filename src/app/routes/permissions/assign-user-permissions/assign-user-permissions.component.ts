import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { User, UserService } from '../../user/user.service';
import { PermissionsAdminService, Role } from '../permissions-admin.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-assign-user-permissions',
  standalone: true,
  templateUrl: './assign-user-permissions.component.html',
  styleUrl: './assign-user-permissions.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatDividerModule
  ],
})
export class AssignUserPermissionsComponent implements OnInit {
  form!: FormGroup;
  users: User[] = [];
  roles: Role[] = [];
  selectedRoleIds: string[] = [];
  usersRolesSummary: { userId: string; username: string; name: string; roles: string }[] = [];
  summaryDisplayedColumns: string[] = ['username', 'name', 'roles'];
  isSummaryLoading = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private permissionsService: PermissionsAdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: [null, Validators.required],
      roleIds: [[], Validators.required],
    });

    this.loadUsers();
    this.loadRoles();

    this.form.get('userId')?.valueChanges.subscribe(userId => {
      if (userId) {
        this.loadUserRoles(userId);
      } else {
        this.form.get('roleIds')?.setValue([]);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: users => {
        this.users = users;
        this.buildUsersRolesSummary();
      },
      error: err => console.error('Error al cargar usuarios', err),
    });
  }

  loadRoles(): void {
    this.permissionsService.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        this.buildUsersRolesSummary();
      },
      error: err => console.error('Error al cargar roles', err),
    });
  }

  loadUserRoles(userId: string): void {
    this.permissionsService.getUserRolesByUser(userId).subscribe({
      next: userRoles => {
        const roleIds = userRoles.map(ur => ur.roleId);
        this.form.get('roleIds')?.setValue(roleIds);
      },
      error: err => console.error('Error al cargar roles del usuario', err),
    });
  }

  private buildUsersRolesSummary(): void {
    if (!this.users.length || !this.roles.length) {
      return;
    }

    const usersWithId = this.users.filter(u => !!u.userId);
    if (!usersWithId.length) {
      this.usersRolesSummary = [];
      return;
    }

    this.isSummaryLoading = true;

    const requests = usersWithId.map(user =>
      this.permissionsService.getUserRolesByUser(user.userId as string).pipe(
        map(userRoles => {
          const roleNames = userRoles
            .map(ur => this.roles.find(r => r.roleId === ur.roleId)?.roleName)
            .filter((name): name is string => !!name)
            .join(', ');

          return {
            userId: user.userId as string,
            username: user.username,
            name: user.name,
            roles: roleNames || 'Sin roles asignados',
          };
        })
      )
    );

    forkJoin(requests).subscribe({
      next: summary => {
        this.usersRolesSummary = summary;
        this.isSummaryLoading = false;
      },
      error: err => {
        console.error('Error al cargar resumen de permisos por usuario', err);
        this.isSummaryLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const userId = this.form.value.userId as string;
    const roleIds = this.form.value.roleIds as string[];

    this.permissionsService.updateUserRoles(userId, roleIds).subscribe({
      next: () => {
        this.toastr.success('Permisos del usuario actualizados');
      },
      error: err => {
        console.error('No se pudieron actualizar los permisos del usuario', err);
      },
    });
  }
}
