import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CambioEstadoPayload, CrearEnvioConPaquetesPayload, CrearEnvioPayload, Envio, EnvioCreado } from '../models/envio.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvioService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl + 'envios';

    obtenerEnvios(): Observable<{ content: Envio[] }> {
        //El backend real pagina por defecto (Laboratorio 9). Pedimos
        //un tamaño grande para simular "todos los envios" en la tabla.
        return this.http.get<{ content: Envio[] }>(`${this.baseUrl}?size=100`);
    }

    obtenerPorRastreo(codigo: string): Observable<Envio> {
        return this.http.get<Envio>(`${this.baseUrl}/rastreo/${codigo}`);
    }

    crearEnvio(payload: CrearEnvioPayload): Observable<Envio> {
        //POST /api/envios (sin /v1) es el endpoint real de creacion,
        //el unico que valida capacidad del vehiculo (Laboratorio 6).
        return this.http.post<Envio>('http://localhost:8080/api/envios', payload);
    }

    actualizarEstado(id: number, payload: CambioEstadoPayload): Observable<Envio> {
        return this.http.patch<Envio>(`http://localhost:8080/api/envios/${id}/estado`, payload);
    }
        private readonly apiEnvios = 'http://localhost:8080/api/envios';

    crearConPaquetes(payload: CrearEnvioConPaquetesPayload): Observable<EnvioCreado> {
        return this.http.post<EnvioCreado>(`${this.apiEnvios}/con-paquetes`, payload);
    }

    existeTracking(codigo: string): Observable<boolean> {
        return this.http
            .get<{ existe: boolean }>(`${this.apiEnvios}/check-tracking/${encodeURIComponent(codigo)}`)
            .pipe(map((resp) => resp.existe));
    }
}