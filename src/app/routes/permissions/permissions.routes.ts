import { Routes } from '@angular/router';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionsRoleSwitchingComponent } from './role-switching/role-switching.component';
import { PermissionsRouteGuardComponent } from './route-guard/route-guard.component';
import { PermissionsTestComponent } from './test/test.component';
import { CreatePermissionComponent } from './create-permission/create-permission.component';
import { CreateRoleComponent } from './create-role/create-role.component';
import { AssignUserPermissionsComponent } from './assign-user-permissions/assign-user-permissions.component';

export const routes: Routes = [
  { path: 'role-switching', component: PermissionsRoleSwitchingComponent },
  {
    path: 'route-guard',
    component: PermissionsRouteGuardComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        except: 'GUEST',
        redirectTo: '/dashboard',
      },
    },
  },
  {
    path: 'test',
    component: PermissionsTestComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: 'ADMIN',
        redirectTo: '/dashboard',
      },
    },
  },
  { path: 'crear-permiso', component: CreatePermissionComponent },
  { path: 'crear-rol', component: CreateRoleComponent },
  { path: 'asignar-permisos-usuario', component: AssignUserPermissionsComponent },
];
