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

export interface PaquetePayload {
    descripcion: string;
    pesoKg: number;
}

export interface CrearEnvioConPaquetesPayload {
    codigoRastreo: string;
    direccionDestino: string;
    costo: number;
    vehiculoId: number;
    conductorId: number;
    fechaDespacho: string;
    fechaEntregaEstimada: string;
    paquetes: PaquetePayload[];
}

export interface EnvioCreado {
    id: number;
    codigoRastreo: string;
    direccionDestino: string;
    pesoKg: number;
    costo: number;
    estadoEnvio: string;
    placaVehiculo: string | null;
    nombreConductor: string | null;
}