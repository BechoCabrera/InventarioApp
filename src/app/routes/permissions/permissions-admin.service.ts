import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Permission {
  permissionId?: string;
  permissionName: string;
  description?: string | null;
}

export interface Role {
  roleId?: string;
  roleName: string;
  description?: string | null;
  permissionIds?: string[];
}

export interface UserRole {
  userId: string;
  roleId: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionsAdminService {
  private readonly permissionsApi = `${environment.apiUrl}/permissions`;
  private readonly rolesApi = `${environment.apiUrl}/roles`;
  private readonly userRolesApi = `${environment.apiUrl}/user-roles`;

  constructor(private http: HttpClient) {}

  // Permissions
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.permissionsApi);
  }

  createPermission(permission: Partial<Permission>): Observable<Permission> {
    return this.http.post<Permission>(this.permissionsApi, permission);
  }

   updatePermission(permissionId: string, permission: Partial<Permission>): Observable<Permission> {
    return this.http.put<Permission>(`${this.permissionsApi}/${permissionId}`, permission);
  }

  deletePermission(permissionId: string): Observable<void> {
    return this.http.delete<void>(`${this.permissionsApi}/${permissionId}`);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesApi);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.rolesApi, role);
  }

  updateRole(roleId: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.rolesApi}/${roleId}`, role);
  }

  deleteRole(roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesApi}/${roleId}`);
  }

  // UserRoles
  getUserRolesByUser(userId: string): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.userRolesApi}/user/${userId}`);
  }

  updateUserRoles(userId: string, roleIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.userRolesApi}/user/${userId}`, { roleIds });
  }
}
