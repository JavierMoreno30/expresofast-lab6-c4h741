export interface Envio {
    id: number;
    codigoRastreo: string;
    direccionDestino: string;
    montoFlete: number;
    estado: 'PENDIENTE' | 'EN_TRANSITO' | 'ENTREGADO' | 'CANCELADO';
    fechaCreacion: string;
}

export interface CrearEnvioPayload {
    codigoRastreo: string;
    direccionDestino: string;
    pesoKg: number;
    costo: number;
    vehiculoId: number;
    conductorId: number;
}

export interface CambioEstadoPayload {
    nuevoEstado: string;
    observaciones?: string;
}