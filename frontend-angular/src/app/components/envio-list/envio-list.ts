import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvioService } from '../../services/envio.service';
import { Envio } from '../../models/envio.model';

@Component({
  selector: 'app-envio-list',
  imports: [CommonModule],
  styleUrl: './envio-list.css',
  templateUrl: './envio-list.html',
})
export class EnvioList implements OnInit {
  private envioService = inject(EnvioService);

  envios = signal<Envio[]>([]);
  cargando = signal(true);
  mensajeError = signal('');

  readonly estadosDisponibles = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO'];

  ngOnInit(): void {
    this.cargarEnvios();
  }

  cargarEnvios(): void {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.envioService.obtenerEnvios().subscribe({
      next: (respuesta) => {
        this.envios.set(respuesta.content);
        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudieron cargar los envios.');
        this.cargando.set(false);
      }
    });
  }

  onCambiarEstado(envio: Envio, evento: Event): void {
    const nuevoEstado = (evento.target as HTMLSelectElement).value;
    if (nuevoEstado === envio.estado) {
      return;
    }

    this.envioService.actualizarEstado(envio.id, { nuevoEstado }).subscribe({
      next: () => this.cargarEnvios(),
      error: () => {
        alert('No se pudo actualizar el estado (verifica tu rol o la transicion solicitada).');
        this.cargarEnvios();
      }
    });
  }
}