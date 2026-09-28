import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnvioService } from '../../services/envio.service';
import { Envio } from '../../models/envio.model';

@Component({
  selector: 'app-envio-tracking',
  imports: [CommonModule, FormsModule],
  styleUrl: './envio-tracking.css',
  templateUrl: './envio-tracking.html',
})
export class EnvioTracking {
  private envioService = inject(EnvioService);

  codigo = '';
  envio: Envio | null = null;
  mensajeError = '';
  buscando = false;

  readonly pasos = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO'];

  buscar(): void {
    this.mensajeError = '';
    this.envio = null;
    if (!this.codigo.trim()) {
      return;
    }

    this.buscando = true;
    this.envioService.obtenerPorRastreo(this.codigo.trim()).subscribe({
      next: (envio) => {
        this.envio = envio;
        this.buscando = false;
      },
      error: () => {
        this.mensajeError = `No se encontro ningun envio con el codigo ${this.codigo}.`;
        this.buscando = false;
      }
    });
  }

  pasoActivo(paso: string): boolean {
    if (!this.envio) return false;
    if (this.envio.estado === 'CANCELADO') return false;
    return this.pasos.indexOf(paso) <= this.pasos.indexOf(this.envio.estado);
  }
}