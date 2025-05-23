import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService, User } from '@core';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared';
import { take } from 'rxjs';

@Component({
  selector: 'app-profile-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  imports: [
    RouterLink,
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    PageHeaderComponent,
    TranslateModule,
  ],
})
export class ProfileLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  user!: User;

  ngOnInit(): void {
    this.auth
      .user()
      .pipe(take(1))
      .subscribe(user => (this.user = user)); //pero se mantiene suscrito para siempre, lo que puede provocar memory leaks si este componente se destruye/recrea frecuentemente.
    //  this.auth.user().subscribe(user => (this.user = user)); //si quieres que se actualice al cambiar usuario, entonces no hay problema con la suscripción viva.
  }

  logout() {
    this.auth.logout().subscribe({
      next: (res: any) => {
        if (res && res.message === 'Sesión cerrada correctamente.') {
          this.router.navigateByUrl('/auth/login');
        } else {
          console.warn('⚠️ Logout inesperado:', res);
        }
      },
      error: err => {
        console.error('❌ Error al cerrar sesión:', err);
      },
    });
  }
}
