import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  mensajeError = signal('');

  onSubmit(): void {
    this.mensajeError.set('');
    this.authService.login(this.username, this.password).subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(respuesta);
        this.router.navigate(['/envios']);
      },
      error: () => {
        this.mensajeError.set('Usuario o contraseña incorrectos.');
      }
    });
  }
}