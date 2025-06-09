import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EntitiConfigService } from '../entiti-config.service';
import { EntitiConfigSaveComponent } from '../entiti-config-save/entiti-config-save.component';
import { EntitiConfigData } from '../entiti-config.model';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '@shared/modal/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-entiti-config-edit',
  templateUrl: './entiti-config-edit.component.html',
  styleUrls: ['./entiti-config-edit.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class EntitiConfigEditComponent implements OnInit {
  entidades: EntitiConfigData[] = [];
  private readonly toast = inject(ToastrService);
  constructor(
    private service: EntitiConfigService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(data => (this.entidades = data));
  }

  edit(entiti: EntitiConfigData): void {
    const dialogRef = this.dialog.open(EntitiConfigSaveComponent, {
      width: '500px',
      data: entiti,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.load();
      }
    });
  }

  delete(entidad: EntitiConfigData): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: '¿Eliminar?',
        message: `¿Está seguro que desea eliminar la entidad "${entidad.entitiName}"?`,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.service.delete(entidad.id!).subscribe({
          next: () => {
            this.toast.success('Entidad eliminada');
            this.load();
          },
          error: () => {
            this.toast.error('Error al eliminar la entidad');
          },
        });
      }
    });
  }
}
