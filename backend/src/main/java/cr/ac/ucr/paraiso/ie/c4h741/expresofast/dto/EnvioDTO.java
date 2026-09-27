package cr.ac.ucr.paraiso.ie.c4h741.expresofast.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
 //DTO de solo lectura para las vistas paginadas
public record EnvioDTO(
        Integer id,
        String codigoRastreo,
        String direccionDestino,
        BigDecimal montoFlete,
        String estado,
        LocalDateTime fechaCreacion
) {
}