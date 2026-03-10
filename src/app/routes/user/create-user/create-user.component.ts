import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { User, UserService } from '../user.service';
import { EntitiConfigData } from 'app/routes/entiti-config/entiti-config.model';
import { EntitiConfigService } from 'app/routes/entiti-config/entiti-config.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,

  ],
})
export class CreateUserComponent implements OnInit {
  form!: FormGroup;
  users: User[] = [];
  displayedColumns: string[] = ['username', 'name', 'email', 'entitiId', 'isActive'];
  isLoading = true;
  entitis: EntitiConfigData[] = [];
  avatars: { value: string; label: string }[] = [
    { value: 'images/avatar-default.jpg', label: 'Avatar por defecto' },
    { value: 'images/avatar.jpg', label: 'Avatar 1' },
    { value: 'images/heros/1.jpg', label: 'Hero 1' },
    { value: 'images/heros/2.jpg', label: 'Hero 2' },
    { value: 'images/heros/3.jpg', label: 'Hero 3' },
    { value: 'images/heros/4.jpg', label: 'Hero 4' },
    { value: 'images/heros/5.jpg', label: 'Hero 5' },
    { value: 'images/heros/6.jpg', label: 'Hero 6' },
    { value: 'images/heros/7.jpg', label: 'Hero 7' },
    { value: 'images/heros/8.jpg', label: 'Hero 8' },
    { value: 'images/heros/9.jpg', label: 'Hero 9' },
    { value: 'images/heros/10.jpg', label: 'Hero 10' },
    { value: 'images/heros/11.jpg', label: 'Hero 11' },
    { value: 'images/heros/12.jpg', label: 'Hero 12' },
    { value: 'images/heros/13.jpg', label: 'Hero 13' },
    { value: 'images/heros/14.jpg', label: 'Hero 14' },
    { value: 'images/heros/15.jpg', label: 'Hero 15' },
  ];
  private readonly toast = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private entitiService: EntitiConfigService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [null, Validators.required],
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      passwordHash: [null, Validators.required],
      entitiId: [null, Validators.required],
      avatar: ['images/heros/2.jpg'],
      isActive: [true],
    });

    this.loadEntitis();
    this.loadUsers();
  }

  loadEntitis(): void {
    this.entitiService.getAll().subscribe({
      next: data => {
        this.entitis = data;
      },
      error: err => {
        console.error('Error al cargar entidades', err);
      },
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: data => {
        this.users = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al cargar usuarios', err);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const user: Partial<User> = {
      username: this.form.value.username,
      name: this.form.value.name,
      email: this.form.value.email,
      passwordHash: this.form.value.passwordHash,
      entitiId: this.form.value.entitiId,
      avatar: this.form.value.avatar,
      isActive: this.form.value.isActive,
    };

    this.userService.create(user).subscribe({
      next: () => {
        this.toast.success('Usuario creado con éxito');
        this.form.reset({ avatar: 'images/heros/2.jpg', isActive: true });
        this.loadUsers();
      },
      error: err => {
        console.error('No se pudo crear el usuario', err);
      },
    });
  }
}
