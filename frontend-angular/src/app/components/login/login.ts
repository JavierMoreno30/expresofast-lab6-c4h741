import { Component, inject } from '@angular/core';
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
  mensajeError = '';

  onSubmit(): void {
    this.mensajeError = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(respuesta);
        this.router.navigate(['/envios']);
      },
      error: () => {
        this.mensajeError = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}