import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

import { PageHeaderComponent } from '@shared';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-permissions-route-guard',
  templateUrl: './route-guard.component.html',
  styleUrl: './route-guard.component.scss',
  imports: [JsonPipe, FormsModule, MatButtonToggleModule, MatCardModule, PageHeaderComponent],
})
export class PermissionsRouteGuardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly rolesSrv = inject(NgxRolesService);
  private readonly permissionsSrv = inject(NgxPermissionsService);

  currentRole = '';

  currentPermissions: string[] = [];

  permissionsOfRole: Record<string, string[]> = {
    ADMIN: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
    MANAGER: ['canAdd', 'canEdit', 'canRead'],
    GUEST: ['canRead'],
  };

  ngOnInit() {
    this.currentRole = Object.keys(this.rolesSrv.getRoles())[0];
    this.currentPermissions = Object.keys(this.permissionsSrv.getPermissions());
  }

  onPermissionChange() {
    this.currentPermissions = this.permissionsOfRole[this.currentRole];
    this.rolesSrv.flushRolesAndPermissions();
    this.rolesSrv.addRoleWithPermissions(this.currentRole, this.currentPermissions);

    this.router.navigateByUrl('/dashboard');
  }
}
