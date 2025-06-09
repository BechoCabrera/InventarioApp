import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Inject } from '@angular/core';
import { EntitiConfigData } from '../entiti-config.model';
import { EntitiConfigService } from '../entiti-config.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-entiti-config-save',
  templateUrl: './entiti-config-save.component.html',
  styleUrls: ['./entiti-config-save.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class EntitiConfigSaveComponent {
  form: FormGroup;
  isEdit = false;
  private readonly toast = inject(ToastrService);
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EntitiConfigSaveComponent>,
    private service: EntitiConfigService,
    @Inject(MAT_DIALOG_DATA) public data: EntitiConfigData
  ) {
    this.isEdit = !!data?.id;
    this.form = this.fb.group({
      id: [data?.id || null],
      code: [data?.code || ''],
      entitiName: [data?.entitiName || ''],
      entitiNit: [data?.entitiNit || ''],
      entitiAddress: [data?.entitiAddress || ''],
      description: [data?.description || ''],
    });
  }

  save() {
    if (this.form.invalid) return;

    const formData = this.form.value;
    if (this.isEdit) {
      this.service.update(formData).subscribe({
        next: (data: any) => {
          this.toast.success('Entidad ' + data.message + ' actualizado correctamente');
          this.dialogRef.close('updated');
        },
        error: value => this.toast.error('Error al actualizar la entidad'),
      });
    } else {
      this.service.create(formData).subscribe({
        next: data => this.toast.success('Entidad creada correctamente'),
        error: () => this.toast.error('Error al crear entidad'),
      });
    }
  }
  cancel() {
    this.dialogRef.close();
  }
}
