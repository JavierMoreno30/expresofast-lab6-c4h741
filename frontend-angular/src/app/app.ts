import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  get autenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  get username(): string | null {
    return this.authService.getUsername();
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}