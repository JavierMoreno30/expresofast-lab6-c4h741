import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EnvioService } from '../../services/envio.service';
import { CrearEnvioPayload } from '../../models/envio.model';

@Component({
  selector: 'app-envio-form',
  imports: [CommonModule, FormsModule],
  styleUrl: './envio-form.css',
  templateUrl: './envio-form.html',
})
export class EnvioForm {
  private envioService = inject(EnvioService);
  private router = inject(Router);

  payload: CrearEnvioPayload = {
    codigoRastreo: '',
    direccionDestino: '',
    pesoKg: 0,
    costo: 0,
    vehiculoId: 1,
    conductorId: 1
  };

  mensajeExito = '';
  mensajeError = '';

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.envioService.crearEnvio(this.payload).subscribe({
      next: () => {
        this.mensajeExito = `Envio ${this.payload.codigoRastreo} registrado correctamente.`;
        setTimeout(() => this.router.navigate(['/envios']), 1200);
      },
      error: (error) => {
        this.mensajeError = error?.error?.error || 'No se pudo registrar el envio.';
      }
    });
  }
}