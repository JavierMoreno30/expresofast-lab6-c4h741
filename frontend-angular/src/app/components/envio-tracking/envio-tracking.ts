import { Component, inject, signal } from '@angular/core';
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
  envio = signal<Envio | null>(null);
  mensajeError = signal('');
  buscando = signal(false);

  readonly pasos = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO'];

  buscar(): void {
    this.mensajeError.set('');
    this.envio.set(null);
    if (!this.codigo.trim()) {
      return;
    }

    this.buscando.set(true);
    this.envioService.obtenerPorRastreo(this.codigo.trim()).subscribe({
      next: (envio) => {
        this.envio.set(envio);
        this.buscando.set(false);
      },
      error: () => {
        this.mensajeError.set(`No se encontro ningun envio con el codigo ${this.codigo}.`);
        this.buscando.set(false);
      }
    });
  }

  pasoActivo(paso: string): boolean {
    const envio = this.envio();
    if (!envio) return false;
    if (envio.estado === 'CANCELADO') return false;
    return this.pasos.indexOf(paso) <= this.pasos.indexOf(envio.estado);
  }
}