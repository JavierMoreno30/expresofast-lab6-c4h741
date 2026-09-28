import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CambioEstadoPayload, CrearEnvioPayload, Envio } from '../models/envio.model';

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
}