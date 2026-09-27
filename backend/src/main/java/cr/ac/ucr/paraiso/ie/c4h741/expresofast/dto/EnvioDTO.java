package cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de solo lectura para las vistas paginadas del Laboratorio 9.
 * No incluye "destinatario" porque el modelo de datos del proyecto
 * (desde el Laboratorio 5) nunca tuvo ese campo — Envio solo guarda
 * la direccion de destino, no el nombre de una persona destinataria.
 */
public record EnvioDTO(
        Integer id,
        String codigoRastreo,
        String direccionDestino,
        BigDecimal montoFlete,
        String estado,
        LocalDateTime fechaCreacion
) {
}